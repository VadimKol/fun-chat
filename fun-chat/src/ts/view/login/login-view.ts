import './login-view.scss';
import { div, label, button, input } from '../../util/tags';
import View from '../view';
import Input from '../../components/input/input';
import Router from '../../router/router';
import Component from '../../util/component';
import { AuthRequest, Pages, RequestType, RequestUser, ValidLength } from '../../util/types';
import Button from '../../components/button/button';
import ServerConnection from '../../server-connection/server-connection';

export default class LoginView extends View {
  private loginInput: Input;

  private passInput: Input;

  private enterButton: Button;

  private loginError: Component;

  private passwordError: Component;

  private serverError: Component;

  private enterBtnHandler: EventListener;

  private enterKeyHandler: EventListener;

  private enterHandler: EventListener;

  private getInfoHandler: EventListener;

  private errorHandler: EventListener;

  private user: RequestUser | null;

  constructor(router: Router, serverConnection: ServerConnection) {
    const params = {
      tag: 'form',
      className: 'login-form',
    };
    super(params);
    this.loginInput = input('name-group__login', this.validateInput.bind(this), 'text', 'Login');
    this.passInput = input('password-group__password', this.validateInput.bind(this), 'password', 'Password');
    this.loginError = label('login__error', '');
    this.passwordError = label('password__error', '');
    this.serverError = label('server__error', '');
    const routerRef = router;
    routerRef.handler.currentComponent = this.getComponent();
    this.enterBtnHandler = () => this.enterBtn(serverConnection);
    this.enterButton = button('login-form__submit', 'Enter', this.enterBtnHandler, 'button');
    this.enterButton.addClass('disabled');
    this.getInfoHandler = () => this.getInfo(router);
    this.setContent();
    this.enterKeyHandler = (event) => this.enterKey(event, serverConnection);
    this.errorHandler = (event) => this.showLoginError(event);
    this.enterHandler = () => this.enter(router);
    this.user = null;

    document.addEventListener('keyup', this.enterKeyHandler);
    document.body.removeEventListener('LoginError', router.bodyHander);
    this.getComponent().getNode().addEventListener('LoginError', this.errorHandler);
    this.getComponent().getNode().addEventListener('Login', this.enterHandler);
  }

  private setContent() {
    this.viewElementCreator.appendChildren([
      div(
        'login-group',
        div('name-group', label('name-group__name-field', 'Login'), this.loginInput),
        this.loginError,
        div('password-group', label('password-group__pass-field', 'Password'), this.passInput),
        this.passwordError,
      ),
      this.enterButton,
      button('login-form__info', 'Info', this.getInfoHandler, 'button'),
      this.serverError,
    ]);
  }

  private enterBtn(serverConnection: ServerConnection) {
    const login = this.loginInput.getNode();
    const password = this.passInput.getNode();

    if (!(login instanceof HTMLInputElement && password instanceof HTMLInputElement)) return;

    if (!(login.classList.contains('input_valid') && password.classList.contains('input_valid'))) return;

    this.user = { login: login.value, password: password.value };

    const authRequest: AuthRequest = {
      id: 'login',
      type: RequestType.USER_LOGIN,
      payload: {
        user: this.user,
      },
    };

    serverConnection.sendRequest(JSON.stringify(authRequest));
  }

  private getInfo(router: Router) {
    document.removeEventListener('keyup', this.enterKeyHandler);
    router.navigate(Pages.ABOUT);
  }

  private validateInput(event: Event) {
    const { target } = event;

    if (!(target instanceof HTMLInputElement)) return;

    const validLength = target.placeholder === 'Password' ? ValidLength.PASSWROD_LENGTH : ValidLength.LOGIN_LENGTH;
    const inputStr = this.isValid(target.value, target.placeholder, validLength);

    if (inputStr) {
      target.classList.add('input_valid');
      this.hideValidationError(target.placeholder);
    } else target.classList.remove('input_valid');

    if (this.loginInput.hasClass('input_valid') && this.passInput.hasClass('input_valid'))
      this.enterButton.removeClass('disabled');
    else this.enterButton.addClass('disabled');
  }

  private isValid(inputStr: string, inputName: string, validLength: ValidLength): boolean {
    let inputElemValid = false;

    if (inputStr.length < validLength)
      this.showValidationError(`${inputName} should be min ${validLength} letters`, inputName);
    else if (!/^[A-Za-z0-9]+$/.exec(inputStr))
      this.showValidationError(`${inputName} must have only English letters or digits`, inputName);
    else if (inputName === 'Password' && inputStr.search(/[A-Z]/g) === -1)
      this.showValidationError(`${inputName} must have capital letter`, inputName);
    else inputElemValid = true;

    return inputElemValid;
  }

  private showValidationError(message: string, inputName: string) {
    if (inputName === 'Password') {
      this.passwordError.addClass('password__error_show');
      this.passwordError.setTextContent(message);
    } else {
      this.loginError.addClass('login__error_show');
      this.loginError.setTextContent(message);
    }
  }

  private hideValidationError(inputName: string) {
    if (inputName === 'Password') this.passwordError.removeClass('password__error_show');
    else this.loginError.removeClass('login__error_show');
  }

  private enterKey(event: Event, serverConnection: ServerConnection) {
    if (!(event instanceof KeyboardEvent)) return;

    const { target } = event;

    if (!(target instanceof Element)) return;

    const loginForm = target.firstElementChild;

    if (
      (loginForm instanceof Element && loginForm.classList.contains('login-form')) ||
      (target instanceof HTMLInputElement && (target.placeholder === 'Password' || target.placeholder === 'Login'))
    )
      if (event.key === 'Enter') this.enterBtn(serverConnection);
  }

  private showLoginError(event: Event) {
    if (!(event instanceof CustomEvent)) return;

    this.serverError.setTextContent(event.detail);
    this.serverError.addClass('server__error_show');
  }

  private enter(router: Router) {
    document.removeEventListener('keyup', this.enterKeyHandler);
    sessionStorage.setItem('loginVK', JSON.stringify(this.user));
    router.navigate(Pages.CHAT);
  }
}
