import {bindable, customElement} from 'aurelia-framework';

@customElement('modal')
export class Modal {
  @bindable public headerText: string;
  @bindable public bodyText: string;
  @bindable public footerText: string;
  @bindable public styleString: string;
}
