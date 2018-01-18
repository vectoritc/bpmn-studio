import * as bundle from '@process-engine/bpmn-js-custom-bundle';
import {bindable, bindingMode, inject, observable} from 'aurelia-framework';
import { setInterval } from 'timers';
import {IBpmnModeler,
        IBpmnModelerConstructor,
        IEvent,
        IEventBus,
        IModdleElement,
        IModeling,
        IShape} from '../../contracts';
import environment from '../../environment';

export class PropertyPanel {

  @bindable()
  public modeler: IBpmnModeler;

  private pages: any;
}
