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

    const path = window.location.pathname.split('/').pop();
    if (!path) return;

    // редирект на логин, если вводит chat
    if (
      path === Pages.CHAT &&
      this.currentComponent.getNode().classList[0] === 'login-form' &&
      sessionStorage.getItem('loginVK') === null
    ) {
      HistoryRouterHandler.setHistory(Pages.LOGIN);
      return;
    }

    // редирект на чат, если вводит login
    if (
      path === Pages.LOGIN &&
      this.currentComponent.getNode().classList[0] === 'chat' &&
      sessionStorage.getItem('loginVK') !== null
    ) {
      HistoryRouterHandler.setHistory(Pages.CHAT);
      return;
    }

    // редирект в зависимости от авторизации
    // если вводит что-то не то
    if (!(path === Pages.CHAT || path === Pages.LOGIN || path === Pages.ABOUT)) {
      if (this.currentComponent.getNode().classList[0] === 'login-form') {
        HistoryRouterHandler.setHistory(Pages.LOGIN);
        return;
      }
      if (this.currentComponent.getNode().classList[0] === 'chat') {
        HistoryRouterHandler.setHistory(Pages.CHAT);
        return;
      }
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
