import './button.scss';
import { ButtonOptions } from '../../util/types';
import Component from '../../util/component';

export default class Button extends Component {
  private onClick: EventListener | null = null;

  private type: string;

  constructor({ className, text, onClick, type = '' }: ButtonOptions) {
    super({ tag: 'button', className, text });
    if (onClick) {
      this.onClick = onClick;
      this.addListener('click', this.onClick);
    }
    this.addClass('button');
    this.type = type;
    this.getNode().setAttribute('type', this.type);
  }

  destroy() {
    if (this.onClick) this.removeListener('click', this.onClick);
    super.destroy();
  }
}
