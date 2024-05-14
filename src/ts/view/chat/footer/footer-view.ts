import './footer-view.scss';
import { a, div, label } from '../../../util/tags';
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
      div('footer__logo'),
      label('footer__school', 'RSSchool'),
      a('footer__author', 'Vadim Kolymbet', 'https://github.com/VadimKol'),
      label('footer__year', '2024'),
    ]);
  }
}
