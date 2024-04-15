import Component from './component';
import { Options } from './types';

export default class View {
  protected viewElementCreator: Component;

  constructor(params: Options = { tag: 'section', className: '', text: '' }) {
    this.viewElementCreator = this.createView(params);
  }

  getHtmlElement(): HTMLElement {
    return this.viewElementCreator.getNode();
  }

  getComponent(): Component {
    return this.viewElementCreator;
  }

  createView(params: Options): Component {
    const elementParams = {
      tag: params.tag,
      className: params.className,
      text: params.text,
    };
    this.viewElementCreator = new Component(elementParams);

    return this.viewElementCreator;
  }
}
