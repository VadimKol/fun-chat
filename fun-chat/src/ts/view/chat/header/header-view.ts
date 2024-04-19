import './header-view.scss';
import { label, div, h2, button } from '../../../util/tags';
import View from '../../view';
import Router from '../../../router/router';
import Component from '../../../util/component';
import ServerConnection from '../../../server-connection/server-connection';
import { AuthRequest, Pages, RequestType } from '../../../util/types';

export default class HeaderView extends View {
  private getInfoHandler: EventListener;

  private exitBtnHandler: EventListener;

  private exitHandler: EventListener;

  private errorHandler: EventListener;

  constructor(parentComponent: Component, router: Router, serverConnection: ServerConnection, modalError: Component) {
    const params = {
      tag: 'header',
      className: 'header',
    };
    super(params);
    const routerRef = router;
    routerRef.handler.currentComponent = parentComponent;
    this.getInfoHandler = () => HeaderView.getInfo(router);
    this.exitBtnHandler = () => HeaderView.exitBtn(serverConnection, modalError);
    this.setContent(modalError);
    this.exitHandler = () => HeaderView.exit(router);
    this.errorHandler = (event) => HeaderView.showLogoutError(event, modalError);

    parentComponent.getNode().addEventListener('LogoutError', this.errorHandler);
    parentComponent.getNode().addEventListener('Logout', this.exitHandler);
  }

  private setContent(modalError: Component) {
    const user = sessionStorage.getItem('loginVK');
    if (!user) return;

    this.viewElementCreator.appendChildren([
      div(
        'header-wrapper',
        label('header-wrapper__user', `User: ${JSON.parse(user).login}`),
        h2('header-wrapper__title', 'Fun Chat'),
      ),
      div(
        'header-buttons',
        button('header-buttons__info', 'Info', this.getInfoHandler, 'button'),
        button('header-buttons__exit', 'Exit', this.exitBtnHandler, 'button'),
      ),
      modalError,
    ]);
  }

  private static getInfo(router: Router) {
    router.navigate(Pages.ABOUT);
  }

  public static exitBtn(serverConnection: ServerConnection, modalError: Component) {
    modalError.removeClass('modal__error_show');

    const user = sessionStorage.getItem('loginVK');
    if (!user) return;

    const authRequest: AuthRequest = {
      id: 'logout',
      type: RequestType.USER_LOGOUT,
      payload: {
        user: JSON.parse(user),
      },
    };

    serverConnection.sendRequest(JSON.stringify(authRequest));
  }

  private static exit(router: Router) {
    const routerRef = router;
    routerRef.lastRecipient = { login: '', online: true };
    sessionStorage.removeItem('loginVK');
    router.navigate(Pages.LOGIN);
  }

  private static showLogoutError(event: Event, modalError: Component) {
    if (!(event instanceof CustomEvent)) return;

    modalError.setTextContent(event.detail);
    modalError.addClass('modal__error_show');
  }
}
