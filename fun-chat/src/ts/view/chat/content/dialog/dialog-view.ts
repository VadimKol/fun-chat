import './dialog-view.scss';
import { button, input, div, label, p } from '../../../../util/tags';
import View from '../../../view';
import ServerConnection from '../../../../server-connection/server-connection';
import Router from '../../../../router/router';
import Component from '../../../../util/component';
import {
  DeliveredMsg,
  HistoryRequest,
  MessageOutcome,
  MessageRequest,
  RecipientWithMessages,
  RequestType,
  ResponseUser,
  UserFromContacts,
} from '../../../../util/types';

export default class DialogView extends View {
  private messageInput: Component;

  private sendBtn: Component;

  private dialogContent: Component;

  private recipientName: Component;

  private recipientStatus: Component;

  private chatHandler: EventListener;

  private refreshStatusAndChatHandler: EventListener;

  private sendMsgHandler: EventListener;

  private errorHandler: EventListener;

  private addSelfMessageHandler: EventListener;

  private addExternalMessageHandler: EventListener;

  private requestToRefreshDialogHandler: EventListener;

  private updateMessageStatusHandler: EventListener;

  private loadHistoryHandler: EventListener;

  private keyEnterHandler: EventListener;

  private messages: RecipientWithMessages[];

  constructor(parentComponent: Component, serverConnection: ServerConnection, router: Router, modalError: Component) {
    const params = {
      tag: 'div',
      className: 'dialog',
    };
    super(params);
    this.messages = [];
    this.sendMsgHandler = () => this.sendMsg(router, serverConnection);
    this.keyEnterHandler = (event) => this.keyEnter(event, router, serverConnection);
    this.messageInput = input('dialog-msg-box__msg', this.keyEnterHandler, 'text', 'Message...');
    this.sendBtn = button('send', 'Send', this.sendMsgHandler, 'button');
    this.sendBtn.addClass('disabled');
    this.errorHandler = (event) => DialogView.showError(event, modalError);
    this.dialogContent = div('dialog-content');

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

      this.messageInput.addClass('dialog-msg-box__msg_show');
    }

    this.addSelfMessageHandler = (event) => this.addSelfMessage(event, router);
    this.addExternalMessageHandler = (event) => this.addExternalMessage(event, router);
    this.requestToRefreshDialogHandler = (event) => DialogView.requestToRefreshDialog(event, serverConnection);
    this.updateMessageStatusHandler = (event) => this.updateMessageStatus(event, router);
    this.loadHistoryHandler = (event) => this.loadHistory(event, router);

    parentComponent.getNode().addEventListener('Chat', this.chatHandler);

    // if (!router.isFirstRender) this.requestToRefreshDialog(serverConnection);
    // serverConnection.connection.addEventListener('open', this.requestToRefreshDialogHandler);

    // нужно запомнить, что когда обновляется список юзеров, обновляется и история сообщений с ними
    router.handler.currentComponent.getNode().addEventListener('GetHistoryUsers', this.requestToRefreshDialogHandler);
    router.handler.currentComponent.getNode().addEventListener('ExternalLogin', this.refreshStatusAndChatHandler);
    router.handler.currentComponent.getNode().addEventListener('ExternalLogout', this.refreshStatusAndChatHandler);
    router.handler.currentComponent.getNode().addEventListener('ReceiveMessageError', this.errorHandler);
    router.handler.currentComponent.getNode().addEventListener('ReceiveSelfMessage', this.addSelfMessageHandler);
    router.handler.currentComponent
      .getNode()
      .addEventListener('ReceiveExternalMessage', this.addExternalMessageHandler);
    router.handler.currentComponent.getNode().addEventListener('GetHistoryError', this.errorHandler);
    router.handler.currentComponent.getNode().addEventListener('GetHistory', this.loadHistoryHandler);
    router.handler.currentComponent.getNode().addEventListener('MessageDelivered', this.updateMessageStatusHandler);
  }

  setContent() {
    this.viewElementCreator.appendChildren([
      div('dialog-recipient', this.recipientName, this.recipientStatus),
      this.dialogContent,
      div('dialog-msg-box', this.messageInput, this.sendBtn),
    ]);
  }

  private keyEnter(event: Event, router: Router, serverConnection: ServerConnection) {
    if (!(event instanceof KeyboardEvent)) return;

    const { target } = event;

    if (!(target instanceof HTMLInputElement)) return;

    if (target.value.length > 0) this.sendBtn.removeClass('disabled');
    else this.sendBtn.addClass('disabled');

    if (event.key === 'Enter' && !this.sendBtn.hasClass('disabled')) this.sendMsg(router, serverConnection);
  }

  private sendMsg(router: Router, serverConnection: ServerConnection) {
    const messageBox = this.messageInput.getNode();
    if (!(messageBox instanceof HTMLInputElement)) return;
    const message = messageBox.value;
    const recipient = router.lastRecipient.login;
    messageBox.value = '';
    this.sendBtn.addClass('disabled');

    const messageRequest: MessageRequest = {
      id: 'msg-send',
      type: RequestType.MSG_SEND,
      payload: {
        message: {
          to: recipient,
          text: message,
        },
      },
    };

    serverConnection.sendRequest(JSON.stringify(messageRequest));
  }

  private chat(event: Event, router: Router) {
    if (!(event instanceof CustomEvent)) return;

    const user: UserFromContacts = event.detail;

    const dialogRecipient = this.getComponent().getChildren()[0];
    if (dialogRecipient) dialogRecipient.addClass('dialog-recipient_show');

    this.recipientName.setTextContent(`User: ${user.login}`);
    this.recipientStatus.setTextContent(user.online ? 'Online' : 'Offline');

    if (user.online) this.recipientStatus.removeClass('dialog-recipient__status_offline');
    else this.recipientStatus.addClass('dialog-recipient__status_offline');

    const routerRef = router;
    routerRef.lastRecipient = user;
    this.messageInput.addClass('dialog-msg-box__msg_show');

    const recipient: RecipientWithMessages | undefined = this.messages.find((el) => el.login === user.login);
    if (recipient) this.showMessages(recipient, router);
    else this.dialogContent.destroyChildren();
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
    }

    // !!
    // this.messages.length = 0;
  }

  private static showError(event: Event, modalError: Component) {
    if (!(event instanceof CustomEvent)) return;

    modalError.setTextContent(event.detail);
    modalError.addClass('modal__error_show');
  }

  private addSelfMessage(event: Event, router: Router) {
    if (!(event instanceof CustomEvent)) return;

    const message: MessageOutcome = event.detail;

    let recipient: RecipientWithMessages | undefined = this.messages.find(
      (el) => el.login === router.lastRecipient.login,
    );

    if (recipient) {
      recipient.messages.push(message);
    } else {
      recipient = { login: router.lastRecipient.login, messages: [] };
      recipient.messages.push(message);
      this.messages.push(recipient);
    }

    this.showMessages(recipient, router);
  }

  private addExternalMessage(event: Event, router: Router) {
    if (!(event instanceof CustomEvent)) return;

    const message: MessageOutcome = event.detail;

    const user = sessionStorage.getItem('loginVK');
    if (!user) return;
    const self: string = JSON.parse(user).login;

    const who = message.to === self ? message.from : message.to;

    let recipient: RecipientWithMessages | undefined = this.messages.find((el) => el.login === who);

    if (recipient) {
      recipient.messages.push(message);
    } else {
      recipient = { login: who, messages: [] };
      recipient.messages.push(message);
      this.messages.push(recipient);
    }

    this.showMessages(recipient, router);
  }

  private showMessages(recipient: RecipientWithMessages, router: Router) {
    if (recipient.login !== router.lastRecipient.login) return;

    this.dialogContent.destroyChildren();
    const user = sessionStorage.getItem('loginVK');
    if (!user) return;
    const self: string = JSON.parse(user).login;

    recipient.messages.forEach((message) => {
      let status: string = '';
      if (message.status.isDelivered) {
        status = 'delivered';
        if (message.status.isReaded) {
          status = 'readed';
          if (message.status.isEdited) status = 'edited';
        }
      } else status = 'sended';

      const messageItem = div(
        'msg',
        div(
          'msg-header',
          label('msg-header__who', `${message.from === self ? 'you' : message.from}`),
          label('msg-header__date', `${DialogView.formatDate(new Date(message.datetime))}`),
        ),
        p('msg__text', `${message.text}`),
        label('msg__status', `${status}`),
      );
      if (message.from === self) messageItem.addClass('msg_self');
      this.dialogContent.append(messageItem);
    });
  }

  public static formatDate(date: Date): string {
    const day = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
    const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
    const year = date.getFullYear() < 10 ? `0${date.getFullYear()}` : `${date.getFullYear()}`;
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const time = `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    return `${day}.${month}.${year}, ${time}`;
  }

  private static requestToRefreshDialog(event: Event, serverConnection: ServerConnection) {
    if (!(event instanceof CustomEvent)) return;

    // serverConnection.connection.removeEventListener('open', this.requestToRefreshDialogHandler);

    const users: UserFromContacts[] = event.detail;
    users.forEach((user) => {
      const historyRequest: HistoryRequest = {
        id: 'get_history',
        type: RequestType.MSG_FROM_USER,
        payload: {
          user: {
            login: user.login,
          },
        },
      };
      serverConnection.sendRequest(JSON.stringify(historyRequest));
    });
  }

  private loadHistory(event: Event, router: Router) {
    if (!(event instanceof CustomEvent)) return;

    const user = sessionStorage.getItem('loginVK');
    if (!user) return;
    const self: string = JSON.parse(user).login;

    // this.messages.length = 0;
    if (event.detail.length > 0) {
      const recipient: RecipientWithMessages = {
        login: event.detail[0].to === self ? event.detail[0].from : event.detail[0].to,
        messages: [],
      };

      event.detail.forEach((message: MessageOutcome) => recipient.messages.push(message));

      this.messages.push(recipient);
      // здесь это нужно, когда из about возвращаются и выбран юзер
      this.showMessages(recipient, router);
    }
  }

  private updateMessageStatus(event: Event, router: Router) {
    if (!(event instanceof CustomEvent)) return;

    const messageInfo: DeliveredMsg = event.detail;

    const recipient: RecipientWithMessages | undefined = this.messages.find((user) =>
      user.messages.find((message) => message.id === messageInfo.id),
    );

    if (recipient) {
      recipient.messages.forEach((message) => {
        if (message.id === messageInfo.id) {
          const msg = message;
          msg.status.isDelivered = messageInfo.status.isDelivered;
        }
      });
      this.showMessages(recipient, router);
    }
  }
}
