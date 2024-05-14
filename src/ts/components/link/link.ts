import { LinkOptions } from '../../util/types';
import Component from '../../util/component';

export default class Link extends Component {
  private href: string;

  constructor({ className, text, href = '' }: LinkOptions) {
    super({ tag: 'a', className, text });
    this.addClass('link');
    this.href = href;
    this.getNode().setAttribute('href', this.href);
  }
}
