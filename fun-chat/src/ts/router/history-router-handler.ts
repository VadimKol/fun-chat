import Component from '../util/component';
import { Pages } from '../util/types';

export default class HistoryRouterHandler {
  private callback: (path: string) => void;

  private handler: EventListener;

  private static prePath: string;

  public currentComponent: Component;

  constructor(callback: (path: string) => void) {
    this.callback = callback;
    this.currentComponent = new Component({ tag: 'div' });
    this.handler = () => this.navigate(null);
    const temp = window.location.pathname.split('/');
    temp.pop();
    temp.push('');
    HistoryRouterHandler.prePath = temp.join('/');

    window.addEventListener('popstate', this.handler);
  }

  public navigate(url: string | null) {
    const currentView = this.currentComponent.getNode().classList[0];

    if (typeof url === 'string') HistoryRouterHandler.setHistory(url);

    if (window.location.hash !== '') {
      if (currentView === 'login-form') HistoryRouterHandler.setHistory(Pages.LOGIN);
      if (currentView === 'chat') HistoryRouterHandler.setHistory(Pages.CHAT);
      return;
    }

    const path = window.location.pathname.split('/').pop();
    if (!path) {
      const where = sessionStorage.getItem('loginVK') !== null ? Pages.CHAT : Pages.LOGIN;
      HistoryRouterHandler.setHistory(where);
      return;
    }

    // редирект на логин, если неавторизованный вводит chat
    if (path === Pages.CHAT && currentView === 'login-form' && sessionStorage.getItem('loginVK') === null) {
      HistoryRouterHandler.setHistory(Pages.LOGIN);
      return;
    }

    // редирект на чат, если авторизованный вводит login
    if (path === Pages.LOGIN && currentView === 'chat' && sessionStorage.getItem('loginVK') !== null) {
      HistoryRouterHandler.setHistory(Pages.CHAT);
      return;
    }

    // редирект в зависимости от авторизации
    // если вводит что-то не то
    if (!(path === Pages.CHAT || path === Pages.LOGIN || path === Pages.ABOUT)) {
      if (currentView === 'login-form') HistoryRouterHandler.setHistory(Pages.LOGIN);
      if (currentView === 'chat') HistoryRouterHandler.setHistory(Pages.CHAT);
      return;
    }

    this.currentComponent.destroy();

    this.callback(path);
  }

  public disable() {
    window.removeEventListener('popstate', this.handler);
  }

  public static setHistory(url: string) {
    window.history.pushState(null, '', `${HistoryRouterHandler.prePath}${url}`);
  }
}
