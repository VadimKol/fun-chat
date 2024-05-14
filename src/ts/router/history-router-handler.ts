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
    if (typeof url === 'string') HistoryRouterHandler.setHistory(url);

    let path = window.location.pathname.split('/').pop();
    if (!path) {
      path = sessionStorage.getItem('loginVK') !== null ? Pages.CHAT : Pages.LOGIN;
      HistoryRouterHandler.setHistory(path);
    }

    if (path === Pages.CHAT && sessionStorage.getItem('loginVK') === null) {
      path = Pages.LOGIN;
      HistoryRouterHandler.setHistory(path);
    }

    if (path === Pages.LOGIN && sessionStorage.getItem('loginVK') !== null) {
      path = Pages.CHAT;
      HistoryRouterHandler.setHistory(path);
    }

    // редирект в зависимости от авторизации
    // если вводит что-то не то
    if (!(path === Pages.CHAT || path === Pages.LOGIN || path === Pages.ABOUT)) {
      path = sessionStorage.getItem('loginVK') !== null ? Pages.CHAT : Pages.LOGIN;
      HistoryRouterHandler.setHistory(path);
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
