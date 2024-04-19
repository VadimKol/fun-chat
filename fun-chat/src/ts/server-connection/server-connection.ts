import Router from '../router/router';
import { AuthResponse, ResponseError, RequestType, ContactsResponse, ContactsRequest } from '../util/types';

export default class ServerConnection {
  public connection: WebSocket;

  private loginHandler: EventListener;

  private logoutHandler: EventListener;

  private getOnlineUsersHandler: EventListener;

  private getOfflineUsersHandler: EventListener;

  private externalLoginHandler: EventListener;

  private externalLogoutHandler: EventListener;

  constructor(url: string, router: Router) {
    this.connection = new WebSocket(url);
    this.loginHandler = (event) => ServerConnection.login(event, router);
    this.logoutHandler = (event) => ServerConnection.logout(event, router);
    this.getOnlineUsersHandler = (event) => ServerConnection.getOnlineUsers(event, router);
    this.getOfflineUsersHandler = (event) => ServerConnection.getOfflineUsers(event, router);
    this.externalLoginHandler = (event) => this.externalLogin(event, router);
    this.externalLogoutHandler = (event) => this.externalLogout(event, router);
    this.connection.addEventListener('message', this.loginHandler);
    this.connection.addEventListener('message', this.logoutHandler);
    this.connection.addEventListener('message', this.getOnlineUsersHandler);
    this.connection.addEventListener('message', this.getOfflineUsersHandler);
    this.connection.addEventListener('message', this.externalLoginHandler);
    this.connection.addEventListener('message', this.externalLogoutHandler);
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

  private static getOnlineUsers(event: Event, router: Router) {
    const currentView = router.handler.currentComponent.getNode();

    if (!(event instanceof MessageEvent)) return;

    const response: ContactsResponse | ResponseError = JSON.parse(event.data);

    if (response.id !== 'get_active_users') return;

    if (response.type === RequestType.ERROR) {
      if ('error' in response.payload)
        currentView.dispatchEvent(
          new CustomEvent('ActiveContactsError', {
            detail: response.payload.error,
            bubbles: true,
          }),
        );
    }

    if (response.type === RequestType.USER_ACTIVE)
      if ('users' in response.payload)
        currentView.dispatchEvent(
          new CustomEvent('ActiveUsers', {
            detail: response.payload.users,
            bubbles: true,
          }),
        );

    // console.log(`Данные получены с сервера: ${event.data}`);
  }

  private static getOfflineUsers(event: Event, router: Router) {
    const currentView = router.handler.currentComponent.getNode();

    if (!(event instanceof MessageEvent)) return;

    const response: ContactsResponse | ResponseError = JSON.parse(event.data);

    if (response.id !== 'get_inactive_users') return;

    if (response.type === RequestType.ERROR) {
      if ('error' in response.payload)
        currentView.dispatchEvent(
          new CustomEvent('InactiveContactsError', {
            detail: response.payload.error,
            bubbles: true,
          }),
        );
    }

    if (response.type === RequestType.USER_INACTIVE)
      if ('users' in response.payload)
        currentView.dispatchEvent(
          new CustomEvent('InactiveUsers', {
            detail: response.payload.users,
            bubbles: true,
          }),
        );

    // console.log(`Данные получены с сервера: ${event.data}`);
  }

  private externalLogin(event: Event, router: Router) {
    const currentView = router.handler.currentComponent.getNode();

    if (!(event instanceof MessageEvent)) return;

    const response: AuthResponse = JSON.parse(event.data);

    if (response.id !== null) return;

    if (response.type === RequestType.USER_EXTERNAL_LOGIN) {
      // если это тот с кем общаемся, нужно обновить статус и диалог
      if ('user' in response.payload)
        currentView.dispatchEvent(
          new CustomEvent('ExternalLogin', {
            detail: response.payload.user,
            bubbles: true,
          }),
        );

      const activeRequest: ContactsRequest = {
        id: 'get_active_users',
        type: RequestType.USER_ACTIVE,
        payload: null,
      };
      const inactiveRequest: ContactsRequest = {
        id: 'get_inactive_users',
        type: RequestType.USER_INACTIVE,
        payload: null,
      };
      // доп запрос, можно и без него, но это проще
      this.sendRequest(JSON.stringify(activeRequest));
      this.sendRequest(JSON.stringify(inactiveRequest));
      // console.log(`Данные получены с сервера: ${event.data}`);
    }
  }

  private externalLogout(event: Event, router: Router) {
    const currentView = router.handler.currentComponent.getNode();

    if (!(event instanceof MessageEvent)) return;

    const response: AuthResponse = JSON.parse(event.data);

    if (response.id !== null) return;

    if (response.type === RequestType.USER_EXTERNAL_LOGOUT) {
      // если это тот с кем общаемся, нужно обновить статус и диалог
      if ('user' in response.payload)
        currentView.dispatchEvent(
          new CustomEvent('ExternalLogout', {
            detail: response.payload.user,
            bubbles: true,
          }),
        );

      const activeRequest: ContactsRequest = {
        id: 'get_active_users',
        type: RequestType.USER_ACTIVE,
        payload: null,
      };
      const inactiveRequest: ContactsRequest = {
        id: 'get_inactive_users',
        type: RequestType.USER_INACTIVE,
        payload: null,
      };
      // доп запрос, можно и без него, но это проще
      this.sendRequest(JSON.stringify(activeRequest));
      this.sendRequest(JSON.stringify(inactiveRequest));
      // console.log(`Данные получены с сервера: ${event.data}`);
    }
  }
}
