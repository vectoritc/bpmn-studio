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
  private modeler: IBpmnModeler;
  private moddle: IBpmnModdle;

  @observable private condition: string;

  public activate(model: IPageModel): void {
    this.businessObjInPanel = model.elementInPanel.businessObject;

    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;
  }

  public isSuitableForElement(elementShape: IShape): boolean {
    if (elementShape !== undefined && elementShape !== null) {
      const element: IFlowElement = elementShape.businessObject;
      if (!this.elementIsFlow(element)) {
        return false;
      }
      const flowPointsAtExclusiveGateway: boolean = element.targetRef.$type === 'bpmn:ExclusiveGateway';
      const flowStartsAtExclusiveGateway: boolean = element.sourceRef.$type === 'bpmn:ExclusiveGateway';

      const flowHasCondition: boolean = flowPointsAtExclusiveGateway || flowStartsAtExclusiveGateway;

      return flowHasCondition;
    }
  }

  private elementIsFlow(element: IFlowElement): boolean {
    return element !== undefined
          && element !== null
          && element.$type === 'bpmn:SequenceFlow';
  }

  private init(): void {
    if (this.businessObjInPanel.conditionExpression) {
      this.condition = this.businessObjInPanel.conditionExpression.body;
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

  private clearCondition(): void {
    this.condition = '';
  }

}
