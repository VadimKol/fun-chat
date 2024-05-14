import './input.scss';
import { InputOptions } from '../../util/types';
import Component from '../../util/component';

export default class Input extends Component {
  private onKeyUp: EventListener | null = null;

  private type: string;

  private placeholder: string;

  constructor({ className, text, onKeyUp, type = '', placeholder = '' }: InputOptions) {
    super({ tag: 'input', className, text });
    if (onKeyUp) {
      this.onKeyUp = onKeyUp;
      this.addListener('keyup', this.onKeyUp);
    }
    this.addClass('input');
    this.type = type;
    this.placeholder = placeholder;
    this.getNode().setAttribute('type', this.type);
    this.getNode().setAttribute('placeholder', this.placeholder);
  }

  destroy() {
    if (this.onKeyUp) this.removeListener('keyup', this.onKeyUp);
    super.destroy();
  }
}
