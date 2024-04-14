import './button.scss';
import { ButtonOptions } from '../../util/types';
import Component from '../../util/component';

export default class Button extends Component {
  private onClick: EventListener | null = null;
  constructor({ className, text, onClick }: ButtonOptions) {
    super({ tag: 'button', className, text });
    if (onClick) {
      this.onClick = onClick;
      this.addListener('click', this.onClick);
    }
  }

  destroy() {
    if (this.onClick) this.removeListener('click', this.onClick);
    super.destroy();
  }
}
