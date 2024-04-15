export interface Car {
  name: string;
  color: string;
  id: number;
}

export interface Winner {
  id: number;
  wins: number;
  time: number;
}

export interface Options {
  tag?: string;
  className?: string;
  text?: string;
}

export interface LinkOptions extends Options {
  href?: string;
}

interface OptionsWithType extends Options {
  type?: string;
}

export interface ButtonOptions extends OptionsWithType {
  onClick?: EventListener;
}

export interface InputOptions extends OptionsWithType {
  onKeyUp?: EventListener;
  placeholder?: string;
}
