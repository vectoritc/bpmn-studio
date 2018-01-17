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

  public elementInPanel: IShape;
  public businessObjInPanel: IModdleElement;

  private eventBus: IEventBus;
  private modeling: IModeling;

  public attached(): void {
    this.eventBus = this.modeler.get('eventBus');
    this.modeling = this.modeler.get('modeling');

    this.eventBus.on('element.click', (event: IEvent) => {
      this.elementInPanel = event.element;
      this.businessObjInPanel = event.element.businessObject;
    });
  }

  private updateName(): void {
    this.modeling.updateProperties(this.elementInPanel, {
      name: this.businessObjInPanel.name,
    });
  }
}
