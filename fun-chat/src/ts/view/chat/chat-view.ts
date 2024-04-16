import View from '../view';
import HeaderView from './header/header-view';
import ContentView from './content/content-view';
import FooterView from './footer/footer-view';
import Router from '../../router/router';

export default class ChatView extends View {
  constructor(router: Router) {
    const params = {
      tag: 'main',
      className: 'chat',
    };
    super(params);
    this.setContent(router);
  }

  private setContent(router: Router) {
    const header = new HeaderView(this.getComponent(), router);
    const content = new ContentView();
    const footer = new FooterView();
    this.viewElementCreator.appendChildren([header.getComponent(), content.getComponent(), footer.getComponent()]);
  }
}
