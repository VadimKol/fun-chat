import { Route, UserFromContacts } from '../util/types';
import HistoryRouterHandler from './history-router-handler';

export default class Router {
  private routes: Route[];

  public handler: HistoryRouterHandler;

  private startHandler: EventListener;

  public bodyHander: EventListener;

  public isFirstContactsRender: boolean;

  public lastRecipient: UserFromContacts;

  constructor(routes: Route[], bodyHandler: EventListener) {
    this.routes = routes;

    this.handler = new HistoryRouterHandler(this.urlChangedHandler.bind(this));

    this.startHandler = () => this.handler.navigate(null);
    window.addEventListener('DOMContentLoaded', this.startHandler);

    this.bodyHander = bodyHandler;

    this.isFirstContactsRender = true;

    this.lastRecipient = { login: '', online: true };
  }

  public navigate(url: string) {
    this.handler.navigate(url);
  }

  private urlChangedHandler(path: string) {
    const route = this.routes.find((item) => item.path === path);

    if (!route) return;

    route.callback();
  }
}
