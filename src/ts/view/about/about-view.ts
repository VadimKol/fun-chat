import './about-view.scss';
import { button, h2, p, a } from '../../util/tags';
import View from '../view';
import Router from '../../router/router';
import { Pages } from '../../util/types';

export default class AboutView extends View {
  private backHandler: EventListener;

  constructor(router: Router) {
    const params = {
      tag: 'main',
      className: 'about',
    };
    super(params);
    const routerRef = router;
    routerRef.handler.currentComponent = this.getComponent();
    this.backHandler = () => AboutView.back(router);
    this.setContent();
  }

  private setContent() {
    this.viewElementCreator.appendChildren([
      h2('about__title', 'Fun Chat'),
      p('about__description', 'Application for chatting developed in RSSchool JS/FE 2023Q4'),
      a('about__author', 'author Vadim Kolymbet', 'https://github.com/VadimKol'),
      button('about__back', 'Get back', this.backHandler, 'button'),
    ]);
  }

  public static back(router: Router) {
    const where = sessionStorage.getItem('loginVK') !== null ? Pages.CHAT : Pages.LOGIN;
    router.navigate(where);
  }
}
