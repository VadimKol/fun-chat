import { Options } from './types';

export default class Component {
  private children: Component[] = [];

  private node: HTMLElement;

  constructor({ tag = 'div', className = '', text = '' }: Options, ...children: Component[]) {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    this.node = node;

    if (children) this.appendChildren(children);
  }

  public append(child: Component) {
    this.children.push(child);
    this.node.append(child.getNode());
  }

  public appendChildren(children: Component[]) {
    children.forEach((el) => {
      this.append(el);
    });
  }

  public getNode(): HTMLElement {
    return this.node;
  }

  public getChildren(): Component[] {
    return this.children;
  }

  public setTextContent(text: string) {
    this.node.textContent = text;
  }

  public setAttribute(attribute: string, value: string) {
    this.node.setAttribute(attribute, value);
  }

  public removeAttribute(attribute: string) {
    this.node.removeAttribute(attribute);
  }

  public addClass(className: string) {
    this.node.classList.add(className);
  }

  public removeClass(className: string) {
    this.node.classList.remove(className);
  }

  public toggleClass(className: string) {
    this.node.classList.toggle(className);
  }

  public addListener(event: string, listener: EventListener, options: boolean | AddEventListenerOptions = false) {
    this.node.addEventListener(event, listener, options);
  }

  public removeListener(event: string, listener: EventListener, options: boolean | AddEventListenerOptions = false) {
    this.node.removeEventListener(event, listener, options);
  }

  public destroyChildren() {
    this.children.forEach((child) => {
      child.destroy();
    });
    this.children.length = 0;
  }

  public destroy() {
    this.destroyChildren();
    this.node.remove();
  }
}
