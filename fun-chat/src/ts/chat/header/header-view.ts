import './header-view.scss';
import { label, div, h2, button } from '../../util/tags';
import View from '../../util/view';

export default class HeaderView extends View {
  constructor() {
    const params = {
      tag: 'header',
      className: 'header',
    };
    super(params);
    this.setContent();
  }

  setContent() {
    /*         const htmlElement = this.viewElementCreator.getElement();
        while (htmlElement.firstElementChild) {
            htmlElement.firstElementChild.remove();
        } */
    this.viewElementCreator.appendChildren([
      div('header-wrapper', label('header-wrapper__user', 'User: '), h2('header-wrapper__title', 'Fun Chat')),
      div(
        'header-buttons',
        button('info', 'Info', HeaderView.getInfo.bind(this), 'button'),
        button('exit', 'Exit', HeaderView.exit.bind(this), 'button'),
      ),
    ]);
  }

  public static getInfo() {}

  public static exit() {}
}
