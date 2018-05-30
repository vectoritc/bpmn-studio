import {
  IBpmnModdle,
  IConditionExpression,
  IFlowElement,
  IPageModel,
  ISection,
  IShape,
} from '../../../../../../contracts';

import {observable} from 'aurelia-framework';

export class FlowSection implements ISection {

  public path: string = '/sections/flow/flow';
  public canHandleElement: boolean = false;
  @observable public condition: string;

  private _businessObjInPanel: IFlowElement;
  private _moddle: IBpmnModdle;

  public activate(model: IPageModel): void {
    this._businessObjInPanel = model.elementInPanel.businessObject;
    this._moddle = model.modeler.get('moddle');

    this._init();
  }

  public isSuitableForElement(elementShape: IShape): boolean {
    if (elementShape !== undefined && elementShape !== null) {
      const element: IFlowElement = elementShape.businessObject;
      if (!this._elementIsFlow(element)) {
        return false;
      }

      const isDefaultFlow: boolean = element.sourceRef.default && element.sourceRef.default.id === element.id;
      if (isDefaultFlow) {
        return false;
      }
      const flowPointsAtExclusiveGateway: boolean = element.targetRef.$type === 'bpmn:ExclusiveGateway';
      const flowStartsAtExclusiveGateway: boolean = element.sourceRef.$type === 'bpmn:ExclusiveGateway';

      const flowHasCondition: boolean = flowPointsAtExclusiveGateway || flowStartsAtExclusiveGateway;

      return flowHasCondition;
    }
  }

  public conditionChanged(newValue: string, oldValue: string): void {
    const objectHasNoConditionExpression: boolean = this._businessObjInPanel.conditionExpression === undefined
                                                 || this._businessObjInPanel.conditionExpression === null;

    if (objectHasNoConditionExpression) {
      this._createConditionExpression();
    }

    this._businessObjInPanel.conditionExpression.body = newValue;
  }

  private _createConditionExpression(): void {
    const conditionExpression: IConditionExpression = this._moddle.create('bpmn:FormalExpression', {});
    this._businessObjInPanel.conditionExpression = conditionExpression;
  }

  private _elementIsFlow(element: IFlowElement): boolean {
    return element !== undefined
          && element !== null
          && element.$type === 'bpmn:SequenceFlow';
  }

  private _init(): void {
    if (this._businessObjInPanel.conditionExpression && this._businessObjInPanel.conditionExpression.body !== undefined) {
      this.condition = this._businessObjInPanel.conditionExpression.body;
    } else {
      this.condition = '';
    }
  }
}
