import './login-view.scss';
import { div, label, button, input } from '../util/tags';
import View from '../util/view';

export default class LoginView extends View {
  constructor() {
    const params = {
      tag: 'form',
      className: 'login-form',
    };
    super(params);
    this.setContent();
  }

  setContent() {
    /*         const htmlElement = this.viewElementCreator.getElement();
        while (htmlElement.firstElementChild) {
            htmlElement.firstElementChild.remove();
        } */
    this.viewElementCreator.appendChildren([
      div(
        'login-group',
        div(
          'name-group',
          label('name-group__name-field', 'Login'),
          input('name-group__login', LoginView.ValidateInput.bind(this), 'text', 'Login'),
        ),
        div(
          'password-group',
          label('password-group__pass-field', 'Password'),
          input('password-group__password', LoginView.ValidateInput.bind(this), 'password', 'Password'),
        ),
      ),
      button('submit', 'Enter', LoginView.EnterApp.bind(this), 'submit'),
      button('info', 'Info', LoginView.getInfo.bind(this), 'button'),
    ]);
  }

  public static EnterApp() {}

  public static getInfo() {}

  public static ValidateInput() {}
}
