import {WidgetConfig} from '@process-engine/bpmn-studio_client';
import {bindable} from 'aurelia-framework';

export class ConfirmWidget {

  @bindable()
  private widget: WidgetConfig;

  private activate(widget: WidgetConfig): void {
    this.widget = widget;
  }

}
