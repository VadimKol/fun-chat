import Router from './router/router';
import { Pages, Route } from './util/types';
import AboutView from './view/about/about-view';
import ChatView from './view/chat/chat-view';
import LoginView from './view/login/login-view';

class App {
  private router: Router;

  constructor() {
    document.body.classList.add('body');
    this.router = new Router(this.createRoutes());
  }

  public start(): void {
    const isNew = sessionStorage.getItem('loginVK') === null;
    const startView: LoginView | ChatView = isNew ? new LoginView(this.router) : new ChatView(this.router);
    document.body.append(startView.getHtmlElement());

    // this.body.addEventListener('updateWinner', () => winners.updateWinnerInfo());
  }

  private createRoutes(): Route[] {
    return [
      {
        path: `${Pages.LOGIN}`,
        callback: () => {
          document.body.append(new LoginView(this.router).getHtmlElement());
        },
      },
      {
        path: `${Pages.CHAT}`,
        callback: () => {
          document.body.append(new ChatView(this.router).getHtmlElement());
        },
      },
      {
        path: `${Pages.ABOUT}`,
        callback: () => {
          document.body.append(new AboutView(this.router).getHtmlElement());
        },
      },
    ];
  }
}

export default App;
