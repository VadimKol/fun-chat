import './dialog-view.scss';
import { button, input, div, label } from '../../../../util/tags';
import View from '../../../view';

export default class DialogView extends View {
  constructor() {
    const params = {
      tag: 'div',
      className: 'dialog',
    };
    super(params);
    this.setContent();
  }

  setContent() {
    // TODO здесь нужен будет доступ к этим дивам, то есть в переменные их
    this.viewElementCreator.appendChildren([
      div('dialog-recipient', label('dialog-recipient__name', 'User'), label('dialog-recipient__status', 'Offline')),
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
}
