import './dialog-view.scss';
import { button, input, div, label } from '../../../../util/tags';
import View from '../../../view';
import ServerConnection from '../../../../server-connection/server-connection';
import Router from '../../../../router/router';
import Component from '../../../../util/component';
import { ResponseUser, UserFromContacts } from '../../../../util/types';

export default class DialogView extends View {
  private recipientName: Component;

  private recipientStatus: Component;

  private chatHandler: EventListener;

  private refreshStatusAndChatHandler: EventListener;

  constructor(parentComponent: Component, serverConnection: ServerConnection, router: Router) {
    const params = {
      tag: 'div',
      className: 'dialog',
    };
    super(params);
    this.chatHandler = (event) => this.chat(event, router);
    this.refreshStatusAndChatHandler = (event) => this.refreshStatusAndChat(event, router);

    this.recipientName = label('dialog-recipient__name', `User: ${router.lastRecipient.login}`);
    this.recipientStatus = label('dialog-recipient__status', router.lastRecipient.online ? 'Online' : 'Offline');

    if (router.lastRecipient.online) this.recipientStatus.removeClass('dialog-recipient__status_offline');
    else this.recipientStatus.addClass('dialog-recipient__status_offline');

    this.setContent();

    if (router.lastRecipient.login !== '') {
      const dialogRecipient = this.getComponent().getChildren()[0];
      if (dialogRecipient) dialogRecipient.addClass('dialog-recipient_show');
    }

    parentComponent.getNode().addEventListener('Chat', this.chatHandler);
    router.handler.currentComponent.getNode().addEventListener('ExternalLogin', this.refreshStatusAndChatHandler);
    router.handler.currentComponent.getNode().addEventListener('ExternalLogout', this.refreshStatusAndChatHandler);
  }

  setContent() {
    // TODO здесь нужен будет доступ к этим дивам, то есть в переменные их
    this.viewElementCreator.appendChildren([
      div('dialog-recipient', this.recipientName, this.recipientStatus),
      div('dialog-content'),
      div(
        'dialog-msg-box',
        input('dialog-msg-box__msg', () => {}, 'text', 'Message...'),
        button('send', 'Send', DialogView.sendMsg.bind(this), 'button'),
      ),
    ]);
  }

  public static searchUser() {}

  public static sendMsg() {}

  private chat(event: Event, router: Router) {
    if (!(event instanceof CustomEvent)) return;

    const user: UserFromContacts = event.detail;

    // type guard, но он может сломать скрипт по идее, если придет не то
    // if(!('login' in user && 'online' in user)) return;

    const dialogRecipient = this.getComponent().getChildren()[0];
    if (dialogRecipient) dialogRecipient.addClass('dialog-recipient_show');

    this.recipientName.setTextContent(`User: ${user.login}`);
    this.recipientStatus.setTextContent(user.online ? 'Online' : 'Offline');

    if (user.online) this.recipientStatus.removeClass('dialog-recipient__status_offline');
    else this.recipientStatus.addClass('dialog-recipient__status_offline');

    const routerRef = router;
    routerRef.lastRecipient = user;
  }

  private refreshStatusAndChat(event: Event, router: Router) {
    if (!(event instanceof CustomEvent)) return;

    const user: ResponseUser = event.detail;

    if (router.lastRecipient.login === user.login) {
      this.recipientStatus.setTextContent(user.isLogined ? 'Online' : 'Offline');
      const routerRef = router;
      routerRef.lastRecipient.online = user.isLogined;
      if (user.isLogined) this.recipientStatus.removeClass('dialog-recipient__status_offline');
      else this.recipientStatus.addClass('dialog-recipient__status_offline');

      // this.refreshChat();
    }
  }
}
