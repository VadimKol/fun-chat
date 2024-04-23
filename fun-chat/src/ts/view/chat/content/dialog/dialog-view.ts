import './dialog-view.scss';
import { button, input, div, label, p } from '../../../../util/tags';
import View from '../../../view';
import ServerConnection from '../../../../server-connection/server-connection';
import Router from '../../../../router/router';
import Component from '../../../../util/component';
import {
  HistoryRequest,
  MessageOutcome,
  MessageRequest,
  ReadMsgRequest,
  RecipientWithMessages,
  RequestType,
  ResponseUser,
  StatusMsg,
  UserFromContacts,
} from '../../../../util/types';
import ContactsView from '../contacts/contacts-view';

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

  private readMsgHandler: EventListener;

  private OptimiseHandler: EventListener;

  private userScrollHandler: EventListener;

  private messages: RecipientWithMessages[];

  private isUserScroll: boolean;

  constructor(
    parentComponent: Component,
    serverConnection: ServerConnection,
    router: Router,
    modalError: Component,
    contactsView: ContactsView,
  ) {
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

    this.recipientName = label('dialog-recipient__name', `${router.lastRecipient.login}`);
    this.recipientStatus = label('dialog-recipient__status', router.lastRecipient.online ? 'Online' : 'Offline');

    if (router.lastRecipient.online) this.recipientStatus.removeClass('dialog-recipient__status_offline');
    else this.recipientStatus.addClass('dialog-recipient__status_offline');

    this.setContent();

    if (router.lastRecipient.login !== '') {
      const dialogRecipient = this.getComponent().getChildren()[0];
      if (dialogRecipient) dialogRecipient.addClass('dialog-recipient_show');

      this.messageInput.addClass('dialog-msg-box__msg_show');
    } else this.dialogContent.addClass('dialog-content_zero');

    this.addSelfMessageHandler = (event) => this.addSelfMessage(event, router, serverConnection);
    this.addExternalMessageHandler = (event) => this.addExternalMessage(event, router, parentComponent, contactsView);
    this.requestToRefreshDialogHandler = (event) => DialogView.requestToRefreshDialog(event, serverConnection);
    this.updateMessageStatusHandler = (event) => this.updateMessageStatus(event, router, parentComponent, contactsView);
    this.loadHistoryHandler = (event) => this.loadHistory(event, router, contactsView, parentComponent);
    this.readMsgHandler = () => this.readMsg(router, serverConnection);

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

    router.handler.currentComponent.getNode().addEventListener('ReadMessageError', this.errorHandler);
    router.handler.currentComponent.getNode().addEventListener('ReadSelfMessage', this.updateMessageStatusHandler);
    router.handler.currentComponent.getNode().addEventListener('ReadExternalMessage', this.updateMessageStatusHandler);

    this.dialogContent.getNode().addEventListener('click', this.readMsgHandler);

    this.userScrollHandler = () => {
      this.isUserScroll = true;
    };

    let ticking = false;
    this.isUserScroll = true;
    this.OptimiseHandler = () => {
      if (this.isUserScroll)
        if (!ticking) {
          setTimeout(() => {
            this.readMsg(router, serverConnection);
            ticking = false;
          }, 10);
          ticking = true;
        }
    };
    this.dialogContent.getNode().addEventListener('scroll', this.OptimiseHandler);
    this.dialogContent.getNode().addEventListener('scrollend', this.userScrollHandler);
  }

  private setContent() {
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

  private readMsg(router: Router, serverConnection: ServerConnection) {
    if (router.lastRecipient.login === '') return;

    const recipientWithUnreadMessages = this.messages.find(
      (ricipient) => ricipient.login === router.lastRecipient.login,
    );
    if (!recipientWithUnreadMessages) return;

    const user = sessionStorage.getItem('loginVK');
    if (!user) return;
    const self: string = JSON.parse(user).login;

    const messages = recipientWithUnreadMessages.messages.filter(
      (message) => !message.status.isReaded && message.to === self,
    );

    messages.forEach((message) => {
      const messageRequest: ReadMsgRequest = {
        id: 'msg-read',
        type: RequestType.MSG_READ,
        payload: {
          message: {
            id: message.id,
          },
        },
      };

      serverConnection.sendRequest(JSON.stringify(messageRequest));
    });
  }

  private chat(event: Event, router: Router) {
    if (!(event instanceof CustomEvent)) return;

    const user: UserFromContacts = event.detail;

    const dialogRecipient = this.getComponent().getChildren()[0];
    if (dialogRecipient) dialogRecipient.addClass('dialog-recipient_show');

    this.recipientName.setTextContent(`${user.login}`);
    this.recipientStatus.setTextContent(user.online ? 'Online' : 'Offline');

    if (user.online) this.recipientStatus.removeClass('dialog-recipient__status_offline');
    else this.recipientStatus.addClass('dialog-recipient__status_offline');

    const routerRef = router;
    routerRef.lastRecipient = user;
    this.messageInput.addClass('dialog-msg-box__msg_show');

    const recipient: RecipientWithMessages | undefined = this.messages.find((el) => el.login === user.login);
    if (recipient) {
      this.showMessages(recipient, router);
      this.dialogContent.removeClass('dialog-content_first');
    } else {
      this.dialogContent.destroyChildren();
      this.dialogContent.addClass('dialog-content_first');
    }

    this.scrollToMsg(recipient);
    this.dialogContent.removeClass('dialog-content_zero');
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

      if (!this.messages.some((message) => message.login === router.lastRecipient.login))
        this.dialogContent.addClass('dialog-content_first');
    }
  }

  private static showError(event: Event, modalError: Component) {
    if (!(event instanceof CustomEvent)) return;

    modalError.setTextContent(event.detail);
    modalError.addClass('modal__error_show');
  }

  private addSelfMessage(event: Event, router: Router, serverConnection: ServerConnection) {
    if (!(event instanceof CustomEvent)) return;

    const message: MessageOutcome = event.detail;

    let recipient: RecipientWithMessages | undefined = this.messages.find(
      (el) => el.login === router.lastRecipient.login,
    );

    if (recipient) {
      recipient.messages.push(message);
    } else {
      recipient = { login: router.lastRecipient.login, messages: [], unread: 0 };
      recipient.messages.push(message);
      this.messages.push(recipient);
    }

    this.showMessages(recipient, router);
    this.readMsg(router, serverConnection);
    this.scrollToMsg(recipient);
    this.dialogContent.removeClass('dialog-content_first');
  }

  private addExternalMessage(event: Event, router: Router, parentComponent: Component, contactsView: ContactsView) {
    if (!(event instanceof CustomEvent)) return;

    const message: MessageOutcome = event.detail;

    const user = sessionStorage.getItem('loginVK');
    if (!user) return;
    const self: string = JSON.parse(user).login;

    const who = message.to === self ? message.from : message.to;

    let recipient: RecipientWithMessages | undefined = this.messages.find((el) => el.login === who);

    if (recipient) {
      recipient.messages.push(message);
      recipient.unread += 1;
    } else {
      recipient = { login: who, messages: [], unread: 1 };
      recipient.messages.push(message);
      this.messages.push(recipient);
    }

    contactsView.users.forEach((el) => {
      if (recipient && el.login === recipient.login) {
        const elRef = el;
        elRef.unread = recipient.unread;
      }
    });

    this.showMessages(recipient, router);
    DialogView.showUnread(recipient, parentComponent);
    this.scrollToMsg(recipient);
    this.dialogContent.removeClass('dialog-content_first');
  }

  private showMessages(recipient: RecipientWithMessages, router: Router) {
    if (recipient.login !== router.lastRecipient.login) return;

    this.dialogContent.destroyChildren();
    const user = sessionStorage.getItem('loginVK');
    if (!user) return;
    const self: string = JSON.parse(user).login;

    const firstUnreadedMsgId = DialogView.getFirstUnreadedMsgId(recipient.messages, self);
    recipient.messages.forEach((message) => {
      let status: string = '';
      if (message.status.isDelivered) {
        status = 'delivered';
        if (message.status.isReaded) {
          status = 'readed';
          if (message.status.isEdited) status = 'edited';
        }
      } else status = 'sended';

      const msgStatus = label('msg__status', `${status}`);
      const messageItem = div(
        'msg',
        div(
          'msg-header',
          label('msg-header__who', `${message.from === self ? 'you' : message.from}`),
          label('msg-header__date', `${DialogView.formatDate(new Date(message.datetime))}`),
        ),
        p('msg__text', `${message.text}`),
        msgStatus,
      );
      if (message.from === self) {
        msgStatus.addClass('msg__status_show');
        messageItem.addClass('msg_self');
      }
      messageItem.setAttribute('id', `${message.id}`);
      if (firstUnreadedMsgId === message.id) messageItem.addClass('msg_divide');
      this.dialogContent.append(messageItem);
    });
  }

  private updateMessages(recipient: RecipientWithMessages, router: Router, event: CustomEvent) {
    if (recipient.login !== router.lastRecipient.login) return;

    const messages = this.dialogContent.getChildren();
    recipient.messages.forEach((message) => {
      messages.forEach((el) => {
        const id = el.getNode().getAttribute('id');
        const status = el.getNode().lastElementChild;
        if (status && id && id === message.id) {
          if (message.status.isDelivered) {
            status.textContent = 'delivered';
            if (message.status.isReaded) {
              status.textContent = 'readed';
              if (message.status.isEdited) status.textContent = 'edited';
            }
          } else status.textContent = 'sended';
          if (event.type === 'ReadSelfMessage') el.removeClass('msg_divide');
        }
      });
    });
  }

  private static showUnread(recipient: RecipientWithMessages, parentComponent: Component) {
    const contacts = parentComponent.getChildren()[0];
    if (!contacts) return;

    const usersList = contacts.getChildren()[1];
    if (!usersList) return;

    const users = usersList.getChildren();

    users.forEach((user) => {
      if (user.getNode().textContent === recipient.login) {
        user.setAttribute('data-after', `${recipient.unread}`);
        if (recipient.unread > 0) user.addClass('contacts-users__user_unread');
        else user.removeClass('contacts-users__user_unread');
      }
    });
  }

  private scrollToMsg(recipient: RecipientWithMessages | undefined) {
    this.isUserScroll = false;
    const user = sessionStorage.getItem('loginVK');
    if (!user) return;
    const self: string = JSON.parse(user).login;

    const messages = this.dialogContent.getChildren();
    const scrollMsgid = DialogView.getScrollMsgId(recipient ? [...recipient.messages] : [], self);
    messages.forEach((message) => {
      if (message.getNode().id === scrollMsgid)
        message.getNode().scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  private static getFirstUnreadedMsgId(messages: MessageOutcome[], self: string): string {
    let id = '';
    messages.some((message) => {
      if (message.from !== self && !message.status.isReaded) {
        id = message.id;
        return true;
      }
      return false;
    });
    return id;
  }

  private static getScrollMsgId(messages: MessageOutcome[], self: string): string {
    let id = '';
    if (messages.length > 0)
      if (messages.some((message) => message.from !== self && !message.status.isReaded)) {
        const firstUnreadMsg = messages.find((message) => message.from !== self && !message.status.isReaded);
        if (firstUnreadMsg) id = firstUnreadMsg.id;
      } else {
        const lastReadMsg = messages.pop();
        if (lastReadMsg) id = lastReadMsg.id;
      }

    return id;
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

  private loadHistory(event: Event, router: Router, contactsView: ContactsView, parentComponent: Component) {
    if (!(event instanceof CustomEvent)) return;

    const user = sessionStorage.getItem('loginVK');
    if (!user) return;
    const self: string = JSON.parse(user).login;

    const messages: MessageOutcome[] = event.detail;

    if (messages.length > 0) {
      const firstMessage = messages[0];
      if (!firstMessage) return;

      const login = firstMessage.to === self ? firstMessage.from : firstMessage.to;

      let unread = 0;

      messages.forEach((el) => {
        if (el.to === self && !el.status.isReaded) unread += 1;
      });

      const recipient: RecipientWithMessages = { login, messages: [...messages], unread };

      contactsView.users.forEach((el) => {
        if (el.login === recipient.login) {
          const elRef = el;
          elRef.unread = recipient.unread;
        }
      });

      this.messages.push(recipient);
      // здесь это нужно, когда из about возвращаются и выбран юзер
      this.dialogContent.removeClass('dialog-content_first');
      this.showMessages(recipient, router);
      DialogView.showUnread(recipient, parentComponent);
      this.scrollToMsg(recipient);
    }
    if (
      router.lastRecipient.login !== '' &&
      !this.messages.some((message) => message.login === router.lastRecipient.login)
    )
      this.dialogContent.addClass('dialog-content_first');
  }

  private updateMessageStatus(event: Event, router: Router, parentComponent: Component, contactsView: ContactsView) {
    if (!(event instanceof CustomEvent)) return;

    const messageInfo: StatusMsg = event.detail;

    const recipient: RecipientWithMessages | undefined = this.messages.find((user) =>
      user.messages.find((message) => message.id === messageInfo.id),
    );

    if (!recipient) return;

    recipient.messages.forEach((message) => {
      if (message.id === messageInfo.id) {
        const msg = message;
        if ('isDelivered' in messageInfo.status) msg.status.isDelivered = messageInfo.status.isDelivered;
        if ('isReaded' in messageInfo.status) msg.status.isReaded = messageInfo.status.isReaded;
      }
    });

    this.updateMessages(recipient, router, event);

    if (event.type === 'ReadSelfMessage') {
      recipient.unread = 0;
      contactsView.users.forEach((el) => {
        if (recipient && el.login === recipient.login) {
          const elRef = el;
          elRef.unread = recipient.unread;
        }
      });
      DialogView.showUnread(recipient, parentComponent);
      this.scrollToMsg(recipient);
    }
  }
}
