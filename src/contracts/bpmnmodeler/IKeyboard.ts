export interface IKeyboard {
  addListener(keyListenerFunction: Function): void;
  hasModifier(modifiers: any): any;
  isCmd(modifiers: any): any;
  isShift(modifiers: any): any;
  bind(node: HTMLElement): void;
  getBinding(): HTMLElement;
  unbind(): void;
}
