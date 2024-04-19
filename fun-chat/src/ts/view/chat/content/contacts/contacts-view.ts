import './contacts-view.scss';
import { ul, input, li } from '../../../../util/tags';
import View from '../../../view';
import ServerConnection from '../../../../server-connection/server-connection';
import { ContactsRequest, RequestType, ResponseUser, UserFromContacts } from '../../../../util/types';
import Router from '../../../../router/router';
import Component from '../../../../util/component';

export default class ContactsView extends View {
  private requestToRefreshContactsHandler: EventListener;

  private errorHandler: EventListener;

  private users: UserFromContacts[];

  private userList: Component;

  constructor(serverConnection: ServerConnection, router: Router, modalError: Component) {
    const params = {
      tag: 'aside',
      className: 'contacts',
    };
    super(params);
    this.users = [];
    this.requestToRefreshContactsHandler = () => this.requestToRefreshContacts(serverConnection, router);
    this.errorHandler = (event) => ContactsView.showError(event, modalError);
    const routerRef = router;
    this.userList = ul('contacts-users');
    this.setContent();

    if (!router.isFirstContactsRender) this.requestToRefreshContacts(serverConnection, router);

    serverConnection.connection.addEventListener('open', this.requestToRefreshContactsHandler);

    routerRef.handler.currentComponent.getNode().addEventListener('ActiveContactsError', this.errorHandler);
    routerRef.handler.currentComponent.getNode().addEventListener('InactiveContactsError', this.errorHandler);
    routerRef.handler.currentComponent.getNode().addEventListener('ActiveUsers', this.addUsers.bind(this));
    routerRef.handler.currentComponent.getNode().addEventListener('InactiveUsers', this.addUsers.bind(this));

    this.userList.addListener('click', ContactsView.clickOnUser.bind(this));
  }

  setContent() {
    this.viewElementCreator.appendChildren([
      input('contacts__search', this.searchUser.bind(this), 'text', 'Search...'),
      this.userList,
    ]);
  }

  public searchUser(event: Event) {
    if (!(event instanceof KeyboardEvent)) return;

    const { target } = event;

    if (!(target instanceof HTMLInputElement)) return;

    const users = target.value.length > 0 ? this.users.filter((user) => user.login.includes(target.value)) : this.users;
    this.showUsers(users);
  }

  private requestToRefreshContacts(serverConnection: ServerConnection, router: Router) {
    const routerRef = router;
    routerRef.isFirstContactsRender = false;
    serverConnection.connection.removeEventListener('open', this.requestToRefreshContactsHandler);
    const activeRequest: ContactsRequest = {
      id: 'get_active_users',
      type: RequestType.USER_ACTIVE,
      payload: null,
    };
    const inactiveRequest: ContactsRequest = {
      id: 'get_inactive_users',
      type: RequestType.USER_INACTIVE,
      payload: null,
    };
    serverConnection.sendRequest(JSON.stringify(activeRequest));
    serverConnection.sendRequest(JSON.stringify(inactiveRequest));
  }

  private addUsers(event: Event) {
    if (!(event instanceof CustomEvent)) return;

    const status = event.type === 'ActiveUsers';

    if (status) this.users.length = 0;

    event.detail.forEach((user: ResponseUser) => {
      this.users.push({
        login: user.login,
        online: status,
      });
    });

    const user = sessionStorage.getItem('loginVK');
    if (!user) return;
    const currentUser: string = JSON.parse(user).login;
    this.users = this.users.filter((el) => el.login !== currentUser);

    this.showUsers(this.users);
  }

  private showUsers(users: UserFromContacts[]) {
    this.userList.destroyChildren();
    users.sort((a, b) => {
      if (a.online && !b.online) return -2;
      if (!a.online && b.online) return 2;
      return (() => {
        if (a.login > b.login) return 1;
        if (a.login < b.login) return -1;
        return 0;
      })();
    });
    users.forEach((user) => {
      const listItem = li('contacts-users__user', user.login);
      listItem.addClass(`contacts-users__user_${user.online ? 'online' : 'offline'}`);
      this.userList.append(listItem);
    });
  }

  private static showError(event: Event, modalError: Component) {
    if (!(event instanceof CustomEvent)) return;

    modalError.setTextContent(event.detail);
    modalError.addClass('modal__error_show');
  }

  private static clickOnUser(event: Event) {
    const { target } = event;
    if (!(target instanceof HTMLLIElement)) return;

    const login = target.textContent;
    if (!login) return;
    const user: UserFromContacts = { login, online: target.classList.contains('contacts-users__user_online') };

    // на content надо ловить это событие
    target.dispatchEvent(
      new CustomEvent('Chat', {
        detail: user,
        bubbles: true,
      }),
    );
  }
}
