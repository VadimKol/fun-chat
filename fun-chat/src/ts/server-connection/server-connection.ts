import Router from '../router/router';
import { AuthResponse, ResponseError, RequestType } from '../util/types';

export default class ServerConnection {
  public connection: WebSocket;

  private loginHandler: EventListener;

  private logoutHandler: EventListener;

  constructor(url: string, router: Router) {
    this.connection = new WebSocket(url);
    this.loginHandler = (event) => ServerConnection.login(event, router);
    this.logoutHandler = (event) => ServerConnection.logout(event, router);
    this.connection.addEventListener('message', this.loginHandler);
    this.connection.addEventListener('message', this.logoutHandler);
  }

  public sendRequest(user: string) {
    this.connection.send(user);
  }

  private static login(event: Event, router: Router) {
    const currentView = router.handler.currentComponent.getNode();

    if (!(event instanceof MessageEvent)) return;

    const response: AuthResponse | ResponseError = JSON.parse(event.data);

    if (response.id !== 'login') return;

    if (response.type === RequestType.ERROR) {
      if ('error' in response.payload)
        currentView.dispatchEvent(
          new CustomEvent('LoginError', {
            detail: response.payload.error,
            bubbles: true,
          }),
        );
    }

    if (response.type === RequestType.USER_LOGIN)
      currentView.dispatchEvent(new CustomEvent('Login', { bubbles: true }));
    // console.log(`Данные получены с сервера: ${event.data}`);
  }

  private static logout(event: Event, router: Router) {
    const currentView = router.handler.currentComponent.getNode();

    if (!(event instanceof MessageEvent)) return;

    const response: AuthResponse | ResponseError = JSON.parse(event.data);

    if (response.id !== 'logout') return;

    if (response.type === RequestType.ERROR) {
      if ('error' in response.payload)
        currentView.dispatchEvent(
          new CustomEvent('LogoutError', {
            detail: response.payload.error,
            bubbles: true,
          }),
        );
    }

    if (response.type === RequestType.USER_LOGOUT)
      currentView.dispatchEvent(new CustomEvent('Logout', { bubbles: true }));
    // console.log(`Данные получены с сервера: ${event.data}`);
  }
}
