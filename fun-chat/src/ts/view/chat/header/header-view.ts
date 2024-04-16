import './header-view.scss';
import { label, div, h2, button } from '../../../util/tags';
import View from '../../view';
import Router from '../../../router/router';
import Component from '../../../util/component';

export default class HeaderView extends View {
  private parentComponent: Component;

  private getInfoHandler: EventListener;

  private exitHandler: EventListener;

  constructor(parentComponent: Component, router: Router) {
    const params = {
      tag: 'header',
      className: 'header',
    };
    super(params);
    this.parentComponent = parentComponent;
    const routerRef = router;
    routerRef.handler.currentComponent = this.parentComponent;
    this.getInfoHandler = () => HeaderView.getInfo(router);
    this.exitHandler = () => HeaderView.exit(router);
    this.setContent();
  }

  private setContent() {
    this.viewElementCreator.appendChildren([
      div('header-wrapper', label('header-wrapper__user', 'User: '), h2('header-wrapper__title', 'Fun Chat')),
      div(
        'header-buttons',
        button('header-buttons__info', 'Info', this.getInfoHandler, 'button'),
        button('header-buttons__exit', 'Exit', this.exitHandler, 'button'),
      ),
    ]);
  }

  public static getInfo(router: Router) {
    router.navigate('about');
  }

  public static exit(router: Router) {
    sessionStorage.removeItem('loginVK');
    router.navigate('login');
  }
}
