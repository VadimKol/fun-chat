import Router from '../../../../router/router';
import Component from '../../../../util/component';
import { div, p } from '../../../../util/tags';
import { RecipientWithMessages, UserFromContacts } from '../../../../util/types';
import { formatDate, getFirstUnreadedMsgId, getScrollMsgId } from '../../../../util/util';

export default class DialogController {
  public chatHandler: EventListener;

  constructor(
    router: Router,
    dialog: Component,
    messages: RecipientWithMessages[],
    recipientName: Component,
    recipientStatus: Component,
    messageInput: Component,
    dialogContent: Component,
    endEditMsg: () => void,
  ) {
    this.chatHandler = (event) =>
      DialogController.chat(
        event,
        router,
        dialog,
        messages,
        recipientName,
        recipientStatus,
        messageInput,
        dialogContent,
        endEditMsg,
      );
  }

  public static chat(
    event: Event,
    router: Router,
    dialog: Component,
    messages: RecipientWithMessages[],
    recipientName: Component,
    recipientStatus: Component,
    messageInput: Component,
    dialogContent: Component,
    endEditMsg: () => void,
  ) {
    if (!(event instanceof CustomEvent)) return;

    const user: UserFromContacts = event.detail;

    const dialogRecipient = dialog.getChildren()[0];
    if (dialogRecipient) dialogRecipient.addClass('dialog-recipient_show');

    recipientName.setTextContent(`${user.login}`);
    recipientStatus.setTextContent(user.online ? 'Online' : 'Offline');

    if (user.online) recipientStatus.removeClass('dialog-recipient__status_offline');
    else recipientStatus.addClass('dialog-recipient__status_offline');

    const routerRef = router;
    routerRef.lastRecipient = user;
    messageInput.addClass('dialog-msg-box__msg_show');

    const recipient: RecipientWithMessages | undefined = messages.find((el) => el.login === user.login);
    if (recipient) {
      DialogController.showMessages(recipient, router, dialogContent);
      dialogContent.removeClass('dialog-content_first');
    } else {
      dialogContent.destroyChildren();
      dialogContent.addClass('dialog-content_first');
    }

    DialogController.scrollToMsg(recipient, dialogContent);
    dialogContent.removeClass('dialog-content_zero');

    endEditMsg();
  }

  public static showMessages(recipient: RecipientWithMessages, router: Router, dialogContent: Component) {
    if (recipient.login !== router.lastRecipient.login) return;

    dialogContent.destroyChildren();
    const user = sessionStorage.getItem('loginVK');
    if (!user) return;
    const self: string = JSON.parse(user).login;

    const firstUnreadedMsgId = getFirstUnreadedMsgId(recipient.messages, self);
    recipient.messages.forEach((message) => {
      let status: string = '';
      let edited: string = '';
      if (message.status.isEdited) edited = 'edited';
      if (message.status.isDelivered) {
        status = 'delivered';
        if (message.status.isReaded) status = 'readed';
      } else status = 'sended';

      const msgStatus = p('msg__status', `${status}`);
      const msgEdit = p('msg__edit', `${edited}`);
      const msgFooter = div('msg-footer', msgEdit, msgStatus);
      const messageItem = div(
        'msg',
        div(
          'msg-header',
          p('msg-header__who', `${message.from === self ? 'you' : message.from}`),
          p('msg-header__date', `${formatDate(new Date(message.datetime))}`),
        ),
        p('msg__text', `${message.text}`),
        msgFooter,
      );
      if (message.from === self) {
        msgStatus.addClass('msg__status_show');
        messageItem.addClass('msg_self');
        msgFooter.addClass('msg-footer_self');
        if (edited !== '') msgFooter.addClass('msg-footer_edit');
      }
      if (edited !== '') msgEdit.addClass('msg__edit_show');
      messageItem.setAttribute('id', `${message.id}`);
      if (firstUnreadedMsgId === message.id) messageItem.addClass('msg_divide');
      dialogContent.append(messageItem);
    });
  }

  public static updateMessages(
    recipient: RecipientWithMessages,
    router: Router,
    event: CustomEvent,
    dialogContent: Component,
  ) {
    if (recipient.login !== router.lastRecipient.login) return;

    const messages = dialogContent.getChildren();
    recipient.messages.forEach((message) => {
      messages.forEach((el) => {
        const id = el.getNode().getAttribute('id');
        const footer = el.getChildren()[2];
        const text = el.getChildren()[1];
        if (!footer) return;
        if (!text) return;
        const status = footer.getNode().lastElementChild;
        const editMsg = footer.getNode().firstElementChild;
        if (status && id && id === message.id) {
          if (message.status.isEdited && editMsg) {
            editMsg.textContent = 'edited';
            editMsg.classList.add('msg__edit_show');
            if (el.hasClass('msg_self')) footer.addClass('msg-footer_edit');
            text.getNode().textContent = message.text;
          }
          if (message.status.isDelivered) {
            status.textContent = 'delivered';
            if (message.status.isReaded) {
              status.textContent = 'readed';
            }
          } else status.textContent = 'sended';
          if (event.type === 'ReadSelfMessage') el.removeClass('msg_divide');
        }
      });
    });
  }

  public static scrollToMsg(recipient: RecipientWithMessages | undefined, dialogContent: Component) {
    const user = sessionStorage.getItem('loginVK');
    if (!user) return;
    const self: string = JSON.parse(user).login;

    const messages = dialogContent.getChildren();
    const scrollMsgid = getScrollMsgId(recipient ? [...recipient.messages] : [], self);
    messages.forEach((message) => {
      if (message.getNode().id === scrollMsgid)
        message.getNode().scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
}
