import './chat-view.scss';
import View from '../view';
import HeaderView from './header/header-view';
import ContentView from './content/content-view';
import FooterView from './footer/footer-view';
import Router from '../../router/router';
import ServerConnection from '../../server-connection/server-connection';
import Component from '../../util/component';
import { label } from '../../util/tags';

export default class ChatView extends View {
  private modalError: Component;

  constructor(router: Router, serverConnection: ServerConnection) {
    const params = {
      tag: 'main',
      className: 'chat',
    };
    super(params);
    this.modalError = label('modal__error', '');
    this.setContent(router, serverConnection);
  }

  private setContent(router: Router, serverConnection: ServerConnection) {
    const header = new HeaderView(this.getComponent(), router, serverConnection, this.modalError);
    const content = new ContentView(serverConnection, router, this.modalError);
    const footer = new FooterView();
    this.viewElementCreator.appendChildren([header.getComponent(), content.getComponent(), footer.getComponent()]);
  }
}
