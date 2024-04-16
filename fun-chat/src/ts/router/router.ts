import { Route } from '../util/types';
import HistoryRouterHandler from './history-router-handler';

export default class Router {
  private routes: Route[];

  public handler: HistoryRouterHandler;

  private startHandler: EventListener;

  constructor(routes: Route[]) {
    this.routes = routes;

    this.handler = new HistoryRouterHandler(this.urlChangedHandler.bind(this));

    this.startHandler = () => this.handler.navigate(null);
    window.addEventListener('DOMContentLoaded', this.startHandler);

    const blockBFCache = () => {};
    window.addEventListener('unload', blockBFCache);
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
