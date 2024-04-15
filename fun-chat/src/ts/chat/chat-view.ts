// import './about-view.scss';
import View from '../util/view';
import HeaderView from './header/header-view';
import ContentView from './content/content-view';
import FooterView from './footer/footer-view';

export default class ChatView extends View {
  constructor() {
    const params = {
      tag: 'main',
      className: 'chat',
    };
    super(params);
    this.setContent();
  }

  setContent() {
    /*         const htmlElement = this.viewElementCreator.getElement();
        while (htmlElement.firstElementChild) {
            htmlElement.firstElementChild.remove();
        } */
    const header = new HeaderView();
    const content = new ContentView();
    const footer = new FooterView();
    this.viewElementCreator.appendChildren([header.getComponent(), content.getComponent(), footer.getComponent()]);
  }
}
