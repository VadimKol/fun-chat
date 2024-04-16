import './footer-view.scss';
import { label } from '../../../util/tags';
import View from '../../view';

export default class FooterView extends View {
  constructor() {
    const params = {
      tag: 'footer',
      className: 'footer',
    };
    super(params);
    this.setContent();
  }

  setContent() {
    this.viewElementCreator.appendChildren([
      label('footer__school', 'RSSchool'),
      label('footer__author', 'Vadim Kolymbet'),
      label('footer__year', '2024'),
    ]);
  }
}
