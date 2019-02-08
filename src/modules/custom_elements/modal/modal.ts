import {bindable, customElement} from 'aurelia-framework';

@customElement('modal')
export class Modal {
  @bindable public headerText: string;
  @bindable public bodyText: string;
  @bindable public footerText: string;

  @bindable public modalStyle: string;
  @bindable public bodyStyle: string;
  @bindable public footerStyle: string;
  @bindable public headerStyle: string;

  @bindable public origin: HTMLElement;
}
