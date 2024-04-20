import Router from '../router/router';
import {
  AuthResponse,
  ResponseError,
  RequestType,
  ContactsResponse,
  MessageResponse,
  HistoryResponse,
  DeliveredMsgResponse,
} from '../util/types';

export default class ServerConnection {
  public connection: WebSocket;

  private loginHandler: EventListener;

  private logoutHandler: EventListener;

  private getOnlineUsersHandler: EventListener;

  private getOfflineUsersHandler: EventListener;

  private externalLoginHandler: EventListener;

  private externalLogoutHandler: EventListener;

  private recieveSelfMessageHandler: EventListener;

  private recieveExternalMessageHandler: EventListener;

  private getHistoryHandler: EventListener;

  private messageDeliveredHandler: EventListener;

  constructor(url: string, router: Router) {
    this.connection = new WebSocket(url);

    this.loginHandler = (event) => ServerConnection.login(event, router);
    this.logoutHandler = (event) => ServerConnection.logout(event, router);
    this.getOnlineUsersHandler = (event) => ServerConnection.getOnlineUsers(event, router);
    this.getOfflineUsersHandler = (event) => ServerConnection.getOfflineUsers(event, router);
    this.externalLoginHandler = (event) => ServerConnection.externalLogin(event, router);
    this.externalLogoutHandler = (event) => ServerConnection.externalLogout(event, router);
    this.recieveSelfMessageHandler = (event) => ServerConnection.recieveSelfMessage(event, router);
    this.recieveExternalMessageHandler = (event) => ServerConnection.recieveExternalMessage(event, router);
    this.getHistoryHandler = (event) => ServerConnection.getHistory(event, router);
    this.messageDeliveredHandler = (event) => ServerConnection.messageDelivered(event, router);

    this.connection.addEventListener('message', this.loginHandler);
    this.connection.addEventListener('message', this.logoutHandler);
    this.connection.addEventListener('message', this.getOnlineUsersHandler);
    this.connection.addEventListener('message', this.getOfflineUsersHandler);
    this.connection.addEventListener('message', this.externalLoginHandler);
    this.connection.addEventListener('message', this.externalLogoutHandler);
    this.connection.addEventListener('message', this.recieveSelfMessageHandler);
    this.connection.addEventListener('message', this.recieveExternalMessageHandler);
    this.connection.addEventListener('message', this.getHistoryHandler);
    this.connection.addEventListener('message', this.messageDeliveredHandler);
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

  private static externalLogin(event: Event, router: Router) {
    const currentView = router.handler.currentComponent.getNode();

    if (!(event instanceof MessageEvent)) return;

    const response: AuthResponse = JSON.parse(event.data);

    if (response.id !== null) return;

    if (response.type === RequestType.USER_EXTERNAL_LOGIN) {
      if ('user' in response.payload)
        currentView.dispatchEvent(
          new CustomEvent('ExternalLogin', {
            detail: response.payload.user,
            bubbles: true,
          }),
        );

      // console.log(`Данные получены с сервера: ${event.data}`);
    }
  }

  private static externalLogout(event: Event, router: Router) {
    const currentView = router.handler.currentComponent.getNode();

    if (!(event instanceof MessageEvent)) return;

    const response: AuthResponse = JSON.parse(event.data);

    if (response.id !== null) return;

    if (response.type === RequestType.USER_EXTERNAL_LOGOUT) {
      if ('user' in response.payload)
        currentView.dispatchEvent(
          new CustomEvent('ExternalLogout', {
            detail: response.payload.user,
            bubbles: true,
          }),
        );
      // console.log(`Данные получены с сервера: ${event.data}`);
    }
  }

  private static recieveSelfMessage(event: Event, router: Router) {
    const currentView = router.handler.currentComponent.getNode();

    if (!(event instanceof MessageEvent)) return;

    const response: MessageResponse | ResponseError = JSON.parse(event.data);

    if (!(response.id === 'msg-send')) return;

    if (response.type === RequestType.ERROR) {
      if ('error' in response.payload)
        currentView.dispatchEvent(
          new CustomEvent('ReceiveMessageError', {
            detail: response.payload.error,
            bubbles: true,
          }),
        );
    }

    if (response.type === RequestType.MSG_SEND)
      if ('message' in response.payload)
        currentView.dispatchEvent(
          new CustomEvent('ReceiveSelfMessage', {
            detail: response.payload.message,
            bubbles: true,
          }),
        );

    // console.log(`Данные получены с сервера: ${event.data}`);
  }

  private static recieveExternalMessage(event: Event, router: Router) {
    const currentView = router.handler.currentComponent.getNode();

    if (!(event instanceof MessageEvent)) return;

    const response: MessageResponse | ResponseError = JSON.parse(event.data);

    if (!(response.id === null)) return;

    if (response.type === RequestType.ERROR) {
      if ('error' in response.payload)
        currentView.dispatchEvent(
          new CustomEvent('ReceiveMessageError', {
            detail: response.payload.error,
            bubbles: true,
          }),
        );
    }

    if (response.type === RequestType.MSG_SEND)
      if ('message' in response.payload)
        currentView.dispatchEvent(
          new CustomEvent('ReceiveExternalMessage', {
            detail: response.payload.message,
            bubbles: true,
          }),
        );

    // console.log(`Данные получены с сервера: ${event.data}`);
  }

  private static getHistory(event: Event, router: Router) {
    const currentView = router.handler.currentComponent.getNode();

    if (!(event instanceof MessageEvent)) return;

    const response: HistoryResponse | ResponseError = JSON.parse(event.data);

    if (response.id !== 'get_history') return;

    if (response.type === RequestType.ERROR) {
      if ('error' in response.payload)
        currentView.dispatchEvent(
          new CustomEvent('GetHistoryError', {
            detail: response.payload.error,
            bubbles: true,
          }),
        );
    }

    if (response.type === RequestType.MSG_FROM_USER)
      if ('messages' in response.payload)
        currentView.dispatchEvent(
          new CustomEvent('GetHistory', {
            detail: response.payload.messages,
            bubbles: true,
          }),
        );

    // console.log(`Данные получены с сервера: ${event.data}`);
  }

  private static messageDelivered(event: Event, router: Router) {
    const currentView = router.handler.currentComponent.getNode();

    if (!(event instanceof MessageEvent)) return;

    const response: DeliveredMsgResponse = JSON.parse(event.data);

    if (response.id !== null) return;

    if (response.type === RequestType.MSG_DELIVER) {
      if ('message' in response.payload)
        currentView.dispatchEvent(
          new CustomEvent('MessageDelivered', {
            detail: response.payload.message,
            bubbles: true,
          }),
        );

      // console.log(`Данные получены с сервера: ${event.data}`);
    }
  }
}
