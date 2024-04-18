import Router from './router/router';
import ServerConnection from './server-connection/server-connection';
import { AuthRequest, Pages, RequestType, Route } from './util/types';
import AboutView from './view/about/about-view';
import ChatView from './view/chat/chat-view';
import LoginView from './view/login/login-view';

class App {
  private router: Router;

  private serverConnection: ServerConnection;

  constructor() {
    document.body.classList.add('body');
    this.preLoginError = this.preLoginError.bind(this);
    this.router = new Router(this.createRoutes(), this.preLoginError);
    this.serverConnection = new ServerConnection('ws://localhost:4000', this.router);
    this.preOpen = this.preOpen.bind(this);
  }

  public start(): void {
    if (sessionStorage.getItem('loginVK') !== null) {
      document.body.addEventListener('LoginError', this.preLoginError);
      this.serverConnection.connection.addEventListener('open', this.preOpen);
    }
  }

  private preOpen() {
    this.serverConnection.connection.removeEventListener('open', this.preOpen);

    const user = sessionStorage.getItem('loginVK');
    if (!user) return;

    const authRequest: AuthRequest = {
      id: 'login',
      type: RequestType.USER_LOGIN,
      payload: {
        user: JSON.parse(user),
      },
    };
    this.serverConnection.sendRequest(JSON.stringify(authRequest));
  }

  private preLoginError() {
    sessionStorage.removeItem('loginVK');
    this.router.navigate(Pages.LOGIN);
  }

  private createRoutes(): Route[] {
    return [
      {
        path: `${Pages.LOGIN}`,
        callback: () => {
          document.body.append(new LoginView(this.router, this.serverConnection).getHtmlElement());
        },
      },
      {
        path: `${Pages.CHAT}`,
        callback: () => {
          document.body.append(new ChatView(this.router, this.serverConnection).getHtmlElement());
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
