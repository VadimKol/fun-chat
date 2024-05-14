import Router from '../router/router';
import { RequestType, AuthRequest, Pages, Response, MessageOutcome, StatusMsg, ResponseUser } from '../util/types';
import ReconnectView from '../view/reconnect/reconnect-view';

export default class ServerConnection {
  public connection: WebSocket;

  private isFirstConnection: boolean;

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

  private readSelfMessageHandler: EventListener;

  private readExternalMessageHandler: EventListener;

  private deleteSelfMessageHandler: EventListener;

  private deleteExternalMessageHandler: EventListener;

  private editSelfMessageHandler: EventListener;

  private editExternalMessageHandler: EventListener;

  private enterHandler: EventListener;

  private reconnectHandler: EventListener;

  private closeHandler: EventListener;

  private openHandler: EventListener;

  private reconnectId: NodeJS.Timeout | null;

  private reconnectView: ReconnectView | null;

  constructor(url: string, router: Router) {
    this.isFirstConnection = true;
    this.connection = new WebSocket(url);

    this.reconnectId = null;
    this.reconnectView = null;

    this.loginHandler = (event) =>
      this.getResponse(event, router, 'login', 'LoginError', RequestType.USER_LOGIN, 'Login');
    this.logoutHandler = (event) =>
      this.getResponse(event, router, 'logout', 'LogoutError', RequestType.USER_LOGOUT, 'Logout');

    this.getOnlineUsersHandler = (event) =>
      this.getResponse(
        event,
        router,
        'get_active_users',
        'ActiveContactsError',
        RequestType.USER_ACTIVE,
        'ActiveUsers',
      );
    this.getOfflineUsersHandler = (event) =>
      this.getResponse(
        event,
        router,
        'get_inactive_users',
        'InactiveContactsError',
        RequestType.USER_INACTIVE,
        'InactiveUsers',
      );

    this.externalLoginHandler = (event) =>
      this.getResponse(event, router, null, '', RequestType.USER_EXTERNAL_LOGIN, 'ExternalLogin');
    this.externalLogoutHandler = (event) =>
      this.getResponse(event, router, null, '', RequestType.USER_EXTERNAL_LOGOUT, 'ExternalLogout');

    this.recieveSelfMessageHandler = (event) =>
      this.getResponse(event, router, 'msg-send', 'DialogError', RequestType.MSG_SEND, 'ReceiveSelfMessage');
    this.recieveExternalMessageHandler = (event) =>
      this.getResponse(event, router, null, '', RequestType.MSG_SEND, 'ReceiveExternalMessage');

    this.getHistoryHandler = (event) =>
      this.getResponse(event, router, 'get_history', 'DialogError', RequestType.MSG_FROM_USER, 'GetHistory');

    this.messageDeliveredHandler = (event) =>
      this.getResponse(event, router, null, '', RequestType.MSG_DELIVER, 'MessageDelivered');

    this.readSelfMessageHandler = (event) =>
      this.getResponse(event, router, 'msg-read', 'DialogError', RequestType.MSG_READ, 'ReadSelfMessage');
    this.readExternalMessageHandler = (event) =>
      this.getResponse(event, router, null, '', RequestType.MSG_READ, 'ReadExternalMessage');

    this.deleteSelfMessageHandler = (event) =>
      this.getResponse(event, router, 'msg-delete', 'DialogError', RequestType.MSG_DELETE, 'DeleteSelfMessage');
    this.deleteExternalMessageHandler = (event) =>
      this.getResponse(event, router, null, '', RequestType.MSG_DELETE, 'DeleteExternalMessage');

    this.editSelfMessageHandler = (event) =>
      this.getResponse(event, router, 'msg-edit', 'DialogError', RequestType.MSG_EDIT, 'EditSelfMessage');
    this.editExternalMessageHandler = (event) =>
      this.getResponse(event, router, null, '', RequestType.MSG_EDIT, 'EditExternalMessage');

    this.enterHandler = () => this.reEnter(router);
    this.reconnectHandler = () => this.reconnect(url);
    this.closeHandler = () => {
      if (this.isFirstConnection) {
        this.isFirstConnection = false;
        this.connection.addEventListener('close', this.reconnectHandler);
      }

      this.connection.close();
    };
    this.openHandler = () => this.open();

    this.addListeners();
  }

  private reEnter(router: Router) {
    this.connection.removeEventListener('Login', this.enterHandler);
    const routerRef = router;
    routerRef.isFirstRender = false;
    router.navigate(Pages.CHAT);
  }

  private reconnect(url: string) {
    this.reconnectView = new ReconnectView();
    document.body.append(this.reconnectView.getHtmlElement());

    this.reconnectId = setInterval(() => {
      this.connection = new WebSocket(url);
      this.addListeners();
    }, 4000);
  }

  public sendRequest(user: string) {
    this.connection.send(user);
  }

  private addListeners() {
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
    this.connection.addEventListener('message', this.readSelfMessageHandler);
    this.connection.addEventListener('message', this.readExternalMessageHandler);
    this.connection.addEventListener('message', this.deleteSelfMessageHandler);
    this.connection.addEventListener('message', this.deleteExternalMessageHandler);
    this.connection.addEventListener('message', this.editSelfMessageHandler);
    this.connection.addEventListener('message', this.editExternalMessageHandler);
    this.connection.addEventListener('open', this.openHandler);
    this.connection.addEventListener('error', this.closeHandler);
  }

  private open() {
    this.isFirstConnection = false;
    this.connection.addEventListener('close', this.reconnectHandler);

    if (!this.reconnectId) return;

    if (this.reconnectView) this.reconnectView.getComponent().destroy();

    clearInterval(this.reconnectId);
    if (sessionStorage.getItem('loginVK') !== null) {
      const user = sessionStorage.getItem('loginVK');
      if (user) {
        const userObj = JSON.parse(user);
        const authRequest: AuthRequest = {
          id: 'login',
          type: RequestType.USER_LOGIN,
          payload: {
            user: userObj,
          },
        };
        this.sendRequest(JSON.stringify(authRequest));
        this.connection.addEventListener('Login', this.enterHandler);
      }
    }
  }

  private getResponse(
    event: Event,
    router: Router,
    responseTypeId: string | null,
    errorEventName: string,
    requestType: RequestType,
    outputEventName: string,
  ) {
    const currentView = router.handler.currentComponent.getNode();

    if (!(event instanceof MessageEvent)) return;

    const response: Response = JSON.parse(event.data);

    if (response.id !== responseTypeId) return;

    if (responseTypeId !== null && response.type === RequestType.ERROR) {
      if ('error' in response.payload)
        currentView.dispatchEvent(
          new CustomEvent(errorEventName, {
            detail: response.payload.error,
            bubbles: true,
          }),
        );
    }

    if (response.type === requestType) {
      let details: ResponseUser[] | ResponseUser | MessageOutcome | StatusMsg | MessageOutcome[] | null = null;

      if ('users' in response.payload) details = response.payload.users;
      if ('user' in response.payload) details = response.payload.user;
      if ('message' in response.payload) details = response.payload.message;
      if ('messages' in response.payload) details = response.payload.messages;

      currentView.dispatchEvent(new CustomEvent(outputEventName, { detail: details, bubbles: true }));

      if (requestType === RequestType.USER_LOGIN)
        this.connection.dispatchEvent(new CustomEvent(outputEventName, { bubbles: true }));
    }
  }
}
