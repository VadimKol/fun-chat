import './dialog-view.scss';
import { button, input, div, label, ul, li } from '../../../../util/tags';
import View from '../../../view';
import ServerConnection from '../../../../server-connection/server-connection';
import Router from '../../../../router/router';
import Component from '../../../../util/component';
import {
  ChangeMsgRequest,
  EditMsgRequest,
  HistoryRequest,
  MessageRequest,
  RecipientWithMessages,
  RequestType,
  UserFromContacts,
} from '../../../../util/types';
import ContactsView from '../contacts/contacts-view';
import DialogEventController from './dialog-event-controller';
import { showError } from '../../../../util/util';
import DialogController from './dialog-controller';

export default class DialogView extends View {
  private messageInput: Component;

  private sendBtn: Component;

  private editBtn: Component;

  private dialogContent: Component;

  private recipientName: Component;

  private recipientStatus: Component;

  private sendMsgHandler: EventListener;

  private errorHandler: EventListener;

  private keyEnterHandler: EventListener;

  private readMsgHandler: EventListener;

  private menuMsgRequestHandler: EventListener;

  private requestGetHistoryHandler: EventListener;

  private messages: RecipientWithMessages[];

  private menu: Component | null;

  private edited: string;

  private eventController: DialogEventController;

  private controller: DialogController;

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
    this.menu = null;
    this.edited = '';
    this.sendMsgHandler = () => this.sendMsg(router, serverConnection);
    this.keyEnterHandler = (event) => this.keyEnter(event, router, serverConnection);
    this.messageInput = input('dialog-msg-box__msg', this.keyEnterHandler, 'text', 'Message...');
    this.sendBtn = button('send', 'Send', this.sendMsgHandler, 'button');
    this.editBtn = button('edit', 'X', this.endEditMsg.bind(this), 'button');
    this.sendBtn.addClass('disabled');
    this.errorHandler = (event) => showError(event, modalError);
    this.dialogContent = div('dialog-content');

    this.recipientName = label('dialog-recipient__name', `${router.lastRecipient.login}`);
    this.recipientStatus = label('dialog-recipient__status', router.lastRecipient.online ? 'Online' : 'Offline');

    this.controller = new DialogController(
      router,
      this.getComponent(),
      this.messages,
      this.recipientName,
      this.recipientStatus,
      this.messageInput,
      this.dialogContent,
      this.endEditMsg.bind(this),
    );

    this.eventController = new DialogEventController(
      parentComponent,
      contactsView,
      serverConnection,
      router,
      this.recipientStatus,
      this.messages,
      this.dialogContent,
      this.readMsg.bind(this),
    );

    if (router.lastRecipient.online) this.recipientStatus.removeClass('dialog-recipient__status_offline');
    else this.recipientStatus.addClass('dialog-recipient__status_offline');

    this.setContent();

    if (router.lastRecipient.login !== '') {
      const dialogRecipient = this.getComponent().getChildren()[0];
      if (dialogRecipient) dialogRecipient.addClass('dialog-recipient_show');

      this.messageInput.addClass('dialog-msg-box__msg_show');
    } else this.dialogContent.addClass('dialog-content_zero');

    this.readMsgHandler = () => this.readMsg(router, serverConnection);

    this.menuMsgRequestHandler = (event) => this.menuMsgRequest(event, serverConnection);

    this.requestGetHistoryHandler = (event) => DialogView.requestGetHistory(event, serverConnection);

    parentComponent.getNode().addEventListener('Chat', this.controller.chatHandler);

    // нужно запомнить, что когда обновляется список юзеров, обновляется и история сообщений с ними
    const chat = router.handler.currentComponent.getNode();
    chat.addEventListener('GetHistoryUsers', this.requestGetHistoryHandler);
    chat.addEventListener('ExternalLogin', this.eventController.refreshUserStatusHandler);
    chat.addEventListener('ExternalLogout', this.eventController.refreshUserStatusHandler);
    chat.addEventListener('ReceiveSelfMessage', this.eventController.addSelfMessageHandler);
    chat.addEventListener('ReceiveExternalMessage', this.eventController.addExternalMessageHandler);
    chat.addEventListener('GetHistory', this.eventController.loadHistoryHandler);
    chat.addEventListener('MessageDelivered', this.eventController.updateMessageStatusHandler);
    chat.addEventListener('ReadSelfMessage', this.eventController.updateMessageStatusHandler);
    chat.addEventListener('ReadExternalMessage', this.eventController.updateMessageStatusHandler);
    chat.addEventListener('DeleteSelfMessage', this.eventController.deleteMessageHandler);
    chat.addEventListener('DeleteExternalMessage', this.eventController.deleteMessageHandler);
    chat.addEventListener('EditSelfMessage', this.eventController.updateMessageStatusHandler);
    chat.addEventListener('EditExternalMessage', this.eventController.updateMessageStatusHandler);
    chat.addEventListener('DialogError', this.errorHandler);

    this.dialogContent.getNode().addEventListener('click', this.readMsgHandler);
    this.dialogContent.getNode().addEventListener('wheel', this.readMsgHandler);

    this.dialogContent.getNode().addEventListener('contextmenu', this.createMenu.bind(this));
    chat.addEventListener('click', this.closeMenu.bind(this));
  }

  private setContent() {
    this.viewElementCreator.appendChildren([
      div('dialog-recipient', this.recipientName, this.recipientStatus),
      this.dialogContent,
      div('dialog-msg-box', div('wrap', this.messageInput, this.editBtn), this.sendBtn),
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

    if (this.edited === '') {
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
    } else {
      const editRequest: EditMsgRequest = {
        id: 'msg-edit',
        type: RequestType.MSG_EDIT,
        payload: {
          message: {
            id: this.edited,
            text: message,
          },
        },
      };
      serverConnection.sendRequest(JSON.stringify(editRequest));
      this.endEditMsg();
    }
  }

  private endEditMsg() {
    const messageBox = this.messageInput.getNode();
    if (!(messageBox instanceof HTMLInputElement)) return;

    messageBox.value = '';
    this.edited = '';
    this.editBtn.removeClass('edit_show');
    this.sendBtn.addClass('disabled');
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
      const messageRequest: ChangeMsgRequest = {
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

  private createMenu(event: Event) {
    const { target } = event;
    if (!(target instanceof HTMLElement)) return;

    const parent = target.parentElement;
    if (!(parent instanceof HTMLElement)) return;

    const msgFromMsgHeader = parent.parentElement;
    if (!(msgFromMsgHeader instanceof HTMLElement)) return;

    let message: HTMLElement | null = null;

    if (target.classList.contains('msg_self')) message = target;
    if (parent.classList.contains('msg_self')) message = parent;
    if (msgFromMsgHeader.classList.contains('msg_self')) message = msgFromMsgHeader;

    if (!message) return;

    event.preventDefault();

    if (this.menu) {
      this.menu.destroy();
      this.menu = null;
    }

    this.menu = ul('msg-menu', li('msg-menu__delete', 'Delete'), li('msg-menu__edit', 'Edit'));

    message.append(this.menu.getNode());

    this.menu.addListener('click', this.menuMsgRequestHandler);
  }

  private menuMsgRequest(event: Event, serverConnection: ServerConnection) {
    const { target } = event;
    if (!(target instanceof HTMLElement)) return;

    const menu = target.parentElement;
    if (!(menu instanceof HTMLElement)) return;

    const message = menu.parentElement;
    if (!(message instanceof HTMLElement)) return;

    if (!target.classList.contains('msg-menu__delete') && !target.classList.contains('msg-menu__edit')) return;

    if (this.menu) {
      this.menu.destroy();
      this.menu = null;
    }

    if (target.classList.contains('msg-menu__delete')) {
      const deleteRequest: ChangeMsgRequest = {
        id: 'msg-delete',
        type: RequestType.MSG_DELETE,
        payload: {
          message: {
            id: message.id,
          },
        },
      };

      serverConnection.sendRequest(JSON.stringify(deleteRequest));
      this.endEditMsg();
    }

    if (target.classList.contains('msg-menu__edit')) {
      const messageBox = this.messageInput.getNode();
      if (!(messageBox instanceof HTMLInputElement)) return;

      const messageText = message.children[1];
      if (!messageText) return;

      const msg = messageText.textContent;
      if (!msg) return;

      messageBox.value = msg;
      this.edited = message.id;
      this.editBtn.addClass('edit_show');
      this.sendBtn.removeClass('disabled');
    }
  }

  private closeMenu(event: Event) {
    const { target } = event;
    if (!(target instanceof HTMLElement)) return;

    if (target.classList.contains('msg-menu__delete') || target.classList.contains('msg-menu__edit')) return;

    if (this.menu) {
      this.menu.destroy();
      this.menu = null;
    }
  }

  private static requestGetHistory(event: Event, serverConnection: ServerConnection) {
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
}
