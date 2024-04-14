import Component from './component';
import Button from '../components/button/button';

export const div = (className: string, ...children: Component[]) =>
  new Component({ tag: 'div', className }, ...children);
export const p = (className: string, text: string) => new Component({ tag: 'p', className, text });

export const h1 = (className: string, text: string) => new Component({ tag: 'h1', className, text });

export const nav = (className: string, ...children: Component[]) =>
  new Component({ tag: 'nav', className }, ...children);

export const ul = (className: string, ...children: Component[]) => new Component({ tag: 'ul', className }, ...children);

export const li = (className: string, text: string) => new Component({ tag: 'li', className, text });

export const button = (className: string, text: string, onClick: EventListener) =>
  new Button({ className, text, onClick });

export function createMenu(menuItems: string[]) {
  return nav('nav', ul('menu', ...menuItems.map((item) => li('menu__item', item))));
}
