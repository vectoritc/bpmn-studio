import {bindable} from 'aurelia-framework';
import {WidgetConfig} from '../../../node_modules/@process-engine/bpmn-studio_client';

export class ConfirmWidget {

  @bindable()
  private widget: WidgetConfig;

  private activate(widget: WidgetConfig): void {
    this.widget = widget;
  }

}
