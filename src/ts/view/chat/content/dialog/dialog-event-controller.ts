import Router from '../../../../router/router';
import ServerConnection from '../../../../server-connection/server-connection';
import Component from '../../../../util/component';
import { MessageOutcome, RecipientWithMessages, ResponseUser, StatusMsg } from '../../../../util/types';
import ContactsView from '../contacts/contacts-view';
import DialogController from './dialog-controller';

export default class DialogEventController {
  public refreshUserStatusHandler: EventListener;

  public addSelfMessageHandler: EventListener;

  public addExternalMessageHandler: EventListener;

  public loadHistoryHandler: EventListener;

  public updateMessageStatusHandler: EventListener;

  public deleteMessageHandler: EventListener;

  constructor(
    parentComponent: Component,
    contactsView: ContactsView,
    serverConnection: ServerConnection,
    router: Router,
    recipientStatus: Component,
    messages: RecipientWithMessages[],
    dialogContent: Component,
    readMsg: (router: Router, serverConnection: ServerConnection) => void,
  ) {
    this.refreshUserStatusHandler = (event) =>
      DialogEventController.refreshUserStatus(event, router, recipientStatus, messages, dialogContent);

    this.addSelfMessageHandler = (event) =>
      DialogEventController.addSelfMessage(event, router, serverConnection, messages, dialogContent, readMsg);

    this.addExternalMessageHandler = (event) =>
      DialogEventController.addExternalMessage(event, router, parentComponent, contactsView, messages, dialogContent);

    this.loadHistoryHandler = (event) =>
      DialogEventController.loadHistory(event, router, contactsView, parentComponent, messages, dialogContent);

    this.updateMessageStatusHandler = (event) =>
      DialogEventController.updateMessageStatus(event, router, parentComponent, contactsView, messages, dialogContent);

    this.deleteMessageHandler = (event) =>
      DialogEventController.deleteMessage(event, router, parentComponent, contactsView, messages, dialogContent);
  }

  public static refreshUserStatus(
    event: Event,
    router: Router,
    recipientStatus: Component,
    messages: RecipientWithMessages[],
    dialogContent: Component,
  ) {
    if (!(event instanceof CustomEvent)) return;

    const user: ResponseUser = event.detail;

    if (router.lastRecipient.login === user.login) {
      recipientStatus.setTextContent(user.isLogined ? 'Online' : 'Offline');
      const routerRef = router;
      routerRef.lastRecipient.online = user.isLogined;
      if (user.isLogined) recipientStatus.removeClass('dialog-recipient__status_offline');
      else recipientStatus.addClass('dialog-recipient__status_offline');

      if (!messages.some((message) => message.login === router.lastRecipient.login))
        dialogContent.addClass('dialog-content_first');
    }
  }

  public static addSelfMessage(
    event: Event,
    router: Router,
    serverConnection: ServerConnection,
    messages: RecipientWithMessages[],
    dialogContent: Component,
    readMsg: (router: Router, serverConnection: ServerConnection) => void,
  ) {
    if (!(event instanceof CustomEvent)) return;

    const message: MessageOutcome = event.detail;

    let recipient: RecipientWithMessages | undefined = messages.find((el) => el.login === router.lastRecipient.login);

    if (recipient) {
      recipient.messages.push(message);
    } else {
      recipient = { login: router.lastRecipient.login, messages: [], unread: 0 };
      recipient.messages.push(message);
      messages.push(recipient);
    }

    DialogController.showMessages(recipient, router, dialogContent);
    readMsg(router, serverConnection);
    DialogController.scrollToMsg(recipient, dialogContent);
    dialogContent.removeClass('dialog-content_first');
  }

  public static addExternalMessage(
    event: Event,
    router: Router,
    parentComponent: Component,
    contactsView: ContactsView,
    messages: RecipientWithMessages[],
    dialogContent: Component,
  ) {
    if (!(event instanceof CustomEvent)) return;

    const message: MessageOutcome = event.detail;

    const user = sessionStorage.getItem('loginVK');
    if (!user) return;
    const self: string = JSON.parse(user).login;

    const who = message.to === self ? message.from : message.to;

    let recipient: RecipientWithMessages | undefined = messages.find((el) => el.login === who);

    if (recipient) {
      recipient.messages.push(message);
      recipient.unread += 1;
    } else {
      recipient = { login: who, messages: [], unread: 1 };
      recipient.messages.push(message);
      messages.push(recipient);
    }

    contactsView.users.forEach((el) => {
      if (recipient && el.login === recipient.login) {
        const elRef = el;
        elRef.unread = recipient.unread;
      }
    });

    DialogController.showMessages(recipient, router, dialogContent);
    DialogEventController.showUnread(recipient, parentComponent);
    DialogController.scrollToMsg(recipient, dialogContent);
    dialogContent.removeClass('dialog-content_first');
  }

  public static loadHistory(
    event: Event,
    router: Router,
    contactsView: ContactsView,
    parentComponent: Component,
    dialogMessages: RecipientWithMessages[],
    dialogContent: Component,
  ) {
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

      dialogMessages.push(recipient);
      // здесь это нужно, когда из about возвращаются и выбран юзер
      dialogContent.removeClass('dialog-content_first');
      DialogController.showMessages(recipient, router, dialogContent);
      DialogEventController.showUnread(recipient, parentComponent);
      DialogController.scrollToMsg(recipient, dialogContent);
    }
    if (
      router.lastRecipient.login !== '' &&
      !dialogMessages.some((message) => message.login === router.lastRecipient.login)
    )
      dialogContent.addClass('dialog-content_first');
  }

  public static updateMessageStatus(
    event: Event,
    router: Router,
    parentComponent: Component,
    contactsView: ContactsView,
    messages: RecipientWithMessages[],
    dialogContent: Component,
  ) {
    if (!(event instanceof CustomEvent)) return;

    const messageInfo: StatusMsg = event.detail;

    const recipient: RecipientWithMessages | undefined = messages.find((user) =>
      user.messages.find((message) => message.id === messageInfo.id),
    );

    if (!recipient) return;

    recipient.messages.forEach((message) => {
      if (message.id === messageInfo.id) {
        const msg = message;
        if ('isDelivered' in messageInfo.status) msg.status.isDelivered = messageInfo.status.isDelivered;
        if ('isReaded' in messageInfo.status) msg.status.isReaded = messageInfo.status.isReaded;
        if ('isEdited' in messageInfo.status) {
          msg.status.isEdited = messageInfo.status.isEdited;
          const text = messageInfo?.text;
          if (text) msg.text = text;
        }
      }
    });

    DialogController.updateMessages(recipient, router, event, dialogContent);

    if (event.type === 'ReadSelfMessage') {
      recipient.unread = 0;
      contactsView.users.forEach((el) => {
        if (recipient && el.login === recipient.login) {
          const elRef = el;
          elRef.unread = recipient.unread;
        }
      });
      DialogEventController.showUnread(recipient, parentComponent);
      DialogController.scrollToMsg(recipient, dialogContent);
    }
  }

  public static deleteMessage(
    event: Event,
    router: Router,
    parentComponent: Component,
    contactsView: ContactsView,
    messages: RecipientWithMessages[],
    dialogContent: Component,
  ) {
    if (!(event instanceof CustomEvent)) return;

    const messageInfo: StatusMsg = event.detail;

    const recipient: RecipientWithMessages | undefined = messages.find((user) =>
      user.messages.find((message) => message.id === messageInfo.id),
    );

    if (!recipient) return;

    recipient.messages.forEach((message) => {
      if (message.id === messageInfo.id) {
        const msg = message;
        if ('isDeleted' in messageInfo.status) {
          if (!message.status.isReaded) recipient.unread -= 1;
          msg.id = '';
        }
      }
    });

    recipient.messages = recipient.messages.filter((message) => message.id !== '');

    DialogController.showMessages(recipient, router, dialogContent);

    if (event.type === 'DeleteExternalMessage') {
      contactsView.users.forEach((el) => {
        if (recipient && el.login === recipient.login) {
          const elRef = el;
          elRef.unread = recipient.unread;
        }
      });
      DialogEventController.showUnread(recipient, parentComponent);
    }
  }

  public static showUnread(recipient: RecipientWithMessages, parentComponent: Component) {
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
}
