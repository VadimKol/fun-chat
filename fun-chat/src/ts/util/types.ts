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
}

export interface UserFromContacts {
  login: string;
  online: boolean;
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

export interface WsError {
  error: string;
}

export interface AuthRequest extends BaseWSFormat {
  payload: {
    user: RequestUser;
  };
}

export interface AuthResponse extends BaseWSFormat {
  payload: {
    user: ResponseUser;
  };
}

export interface ContactsRequest extends BaseWSFormat {
  payload: null;
}

export interface ContactsResponse extends BaseWSFormat {
  payload: {
    users: ResponseUser[];
  };
}

export interface ResponseError extends BaseWSFormat {
  payload: WsError;
}
