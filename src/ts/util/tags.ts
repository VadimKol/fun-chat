import Component from './component';
import Button from '../components/button/button';
import Input from '../components/input/input';
import Link from '../components/link/link';

export const div = (className: string, ...children: Component[]) =>
  new Component({ tag: 'div', className }, ...children);
export const p = (className: string, text: string) => new Component({ tag: 'p', className, text });

export const label = (className: string, text: string) => new Component({ tag: 'label', className, text });

export const h1 = (className: string, text: string) => new Component({ tag: 'h1', className, text });

export const h2 = (className: string, text: string) => new Component({ tag: 'h2', className, text });

export const ul = (className: string, ...children: Component[]) => new Component({ tag: 'ul', className }, ...children);

export const li = (className: string, text: string) => new Component({ tag: 'li', className, text });

export const a = (className: string, text: string, href: string) => new Link({ className, text, href });

export const button = (className: string, text: string, onClick: EventListener, type: string) =>
  new Button({ className, text, onClick, type });

export const input = (className: string, onKeyUp: EventListener, type: string, placeholder: string) =>
  new Input({ className, onKeyUp, type, placeholder });
