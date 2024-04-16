import './login-view.scss';
import { div, label, button, input } from '../../util/tags';
import View from '../view';
import Input from '../../components/input/input';
import Router from '../../router/router';

export default class LoginView extends View {
  private loginInput: Input;

  private passInput: Input;

  private enterHandler: EventListener;

  private getInfoHandler: EventListener;

  constructor(router: Router) {
    const params = {
      tag: 'form',
      className: 'login-form',
    };
    super(params);
    this.loginInput = input('name-group__login', LoginView.validateInput.bind(this), 'text', 'Login');
    this.passInput = input('password-group__password', LoginView.validateInput.bind(this), 'password', 'Password');
    const routerRef = router;
    routerRef.handler.currentComponent = this.getComponent();
    this.enterHandler = () => this.enterApp(router);
    this.getInfoHandler = () => LoginView.getInfo(router);
    this.setContent();
  }

  private setContent() {
    this.viewElementCreator.appendChildren([
      div(
        'login-group',
        div('name-group', label('name-group__name-field', 'Login'), this.loginInput),
        div('password-group', label('password-group__pass-field', 'Password'), this.passInput),
      ),
      button('login-form__submit', 'Enter', this.enterHandler, 'submit'),
      button('login-form__info', 'Info', this.getInfoHandler, 'button'),
    ]);
  }

  private enterApp(router: Router) {
    // JSON.parse(sessionStorage.getItem('loginVK'))
    const login = this.loginInput.getNode();
    const password = this.passInput.getNode();

    if (login instanceof HTMLInputElement && password instanceof HTMLInputElement)
      sessionStorage.setItem('loginVK', JSON.stringify({ login: login.value, password: password.value }));

    router.navigate('chat');
  }

  public static getInfo(router: Router) {
    router.navigate('about');
  }

  public static validateInput() {}
}
