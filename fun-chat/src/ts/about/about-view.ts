import './about-view.scss';
import { button, h2, p, a } from '../util/tags';
import View from '../util/view';

export default class AboutView extends View {
  constructor() {
    const params = {
      tag: 'main',
      className: 'about',
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
      h2('about__title', 'Fun Chat'),
      p('about__description', 'Application developed for demonstration task Fun Chat in RSSchool JS/FE 2023Q4'),
      a('about__author', 'author Vadim Kolymbet', 'https://github.com/VadimKol'),
      button('about__back', 'Get back', AboutView.Back.bind(this), 'button'),
    ]);
  }

  public static Back() {}
}
