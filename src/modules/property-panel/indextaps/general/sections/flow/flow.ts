import { observable } from 'aurelia-framework';

import {IBpmnModdle,
  IBpmnModeler,
  IConditionExpression,
  IEvent,
  IEventBus,
  IFlowElement,
  IModdleElement,
  IPageModel,
  ISection,
  IShape} from '../../../../../../contracts';

export class FlowSection implements ISection {

  public path: string = '/sections/flow/flow';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IFlowElement;
  private eventBus: IEventBus;
  private modeler: IBpmnModeler;
  private moddle: IBpmnModdle;

  @observable private condition: string;

  public activate(model: IPageModel): void {
    this.eventBus = model.modeler.get('eventBus');
    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;

    const selectedEvents: Array<IShape> = this.modeler.get('selection')._selectedElements;
    if (selectedEvents[0]) {
      this.businessObjInPanel = selectedEvents[0].businessObject;
      this.init();
    }

    this.eventBus.on(['element.click', 'shape.changed', 'selection.changed'], (event: IEvent) => {
      if (event.newSelection && event.newSelection.length !== 0) {
        this.businessObjInPanel = event.newSelection[0].businessObject;
      } else if (event.element) {
        this.businessObjInPanel = event.element.businessObject;
      }
      this.init();
    });
  }

  private init(): void {
    if (this.businessObjInPanel.conditionExpression) {
      this.condition = this.businessObjInPanel.conditionExpression.body;
    }

    this.canHandleElement = this.checkElement(this.businessObjInPanel);
  }

  public checkElement(element: IFlowElement): boolean {
    if (element &&
        element.$type === 'bpmn:SequenceFlow' &&
        element.targetRef.$type === 'bpmn:ExclusiveGateway') {
      return true;
    } else {
      return false;
    }
  }

  private conditionChanged(newValue: string, oldValue: string): void {
    if (!this.businessObjInPanel.conditionExpression) {
      this.createConditionExpression();
    }

    this.businessObjInPanel.conditionExpression.body = newValue;
  }

  private createConditionExpression(): void {
    const conditionExpression: IConditionExpression = this.moddle.create('bpmn:FormalExpression', {});
    this.businessObjInPanel.conditionExpression = conditionExpression;
  }

}
