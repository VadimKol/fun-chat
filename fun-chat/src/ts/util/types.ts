export enum Pages {
  LOGIN = 'login',
  CHAT = 'chat',
  ABOUT = 'about',
}

export enum ValidLength {
  LOGIN_LENGTH = 3,
  PASSWROD_LENGTH = 6,
}

export interface Route {
  path: string;
  callback: () => void;
}

export interface Options {
  tag?: string;
  className?: string;
  text?: string;
}

export interface LinkOptions extends Options {
  href?: string;
}

interface OptionsWithType extends Options {
  type?: string;
}

export interface ButtonOptions extends OptionsWithType {
  onClick?: EventListener;
}

export interface InputOptions extends OptionsWithType {
  onKeyUp?: EventListener;
  placeholder?: string;
}

export enum RequestType {
  ERROR = 'ERROR',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_ACTIVE = 'USER_ACTIVE',
  USER_INACTIVE = 'USER_INACTIVE',
  USER_EXTERNAL_LOGIN = 'USER_EXTERNAL_LOGIN',
  USER_EXTERNAL_LOGOUT = 'USER_EXTERNAL_LOGOUT',
  MSG_SEND = 'MSG_SEND',
  MSG_FROM_USER = 'MSG_FROM_USER',
  MSG_DELIVER = 'MSG_DELIVER',
  MSG_READ = 'MSG_READ',
  MSG_DELETE = 'MSG_DELETE',
  MSG_EDIT = 'MSG_EDIT',
}

export interface UserFromContacts {
  login: string;
  online: boolean;
  unread: number;
}

interface BaseWSFormat {
  id: string | null;
  type: RequestType;
}

export interface RequestUser {
  login: string;
  password: string;
}

export interface ResponseUser {
  login: string;
  isLogined: boolean;
}

export interface MessageIncome {
  to: string;
  text: string;
}

export interface Status {
  isDelivered?: boolean;
  isReaded?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
}

export interface MessageOutcome {
  id: string;
  from: string;
  to: string;
  text: string;
  datetime: number;
  status: Status;
}

export interface RecipientWithMessages {
  login: string;
  messages: MessageOutcome[];
  unread: number;
}

export interface StatusMsg {
  id: string;
  text?: string;
  status: Status;
}

export interface IdMsg {
  id: string;
}

export interface EditMsg extends IdMsg {
  text: string;
}

export interface LoginToGetHistory {
  login: string;
}

export interface WsError {
  error: string;
}

export interface AuthRequest extends BaseWSFormat {
  payload: {
    user: RequestUser;
  };
}

interface AuthResponse extends BaseWSFormat {
  payload: {
    user: ResponseUser;
  };
}

export interface MessageRequest extends BaseWSFormat {
  payload: {
    message: MessageIncome;
  };
}

interface MessageResponse extends BaseWSFormat {
  payload: {
    message: MessageOutcome;
  };
}

export interface HistoryRequest extends BaseWSFormat {
  payload: {
    user: LoginToGetHistory;
  };
}

interface HistoryResponse extends BaseWSFormat {
  payload: {
    messages: MessageOutcome[];
  };
}

export interface ContactsRequest extends BaseWSFormat {
  payload: null;
}

interface ContactsResponse extends BaseWSFormat {
  payload: {
    users: ResponseUser[];
  };
}

interface StatusMsgResponse extends BaseWSFormat {
  payload: {
    message: StatusMsg;
  };
}

export interface ChangeMsgRequest extends BaseWSFormat {
  payload: {
    message: IdMsg;
  };
}

export interface EditMsgRequest extends BaseWSFormat {
  payload: {
    message: EditMsg;
  };
}

interface ResponseError extends BaseWSFormat {
  payload: WsError;
}

export type Response =
  | AuthResponse
  | ResponseError
  | ContactsResponse
  | MessageResponse
  | HistoryResponse
  | StatusMsgResponse;
