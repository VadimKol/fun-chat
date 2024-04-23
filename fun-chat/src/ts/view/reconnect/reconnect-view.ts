import './reconnect-view.scss';
import { p, div } from '../../util/tags';
import View from '../view';

export default class ReconnectView extends View {
  constructor() {
    const params = {
      tag: 'div',
      className: 'reconnect',
    };
    super(params);
    this.setContent();
  }

  private setContent() {
    this.viewElementCreator.appendChildren([
      div('reconnect-modal', p('reconnect-modal__text', 'Trying to reconnect...')),
    ]);
  }
}
