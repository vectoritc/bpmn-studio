import {IBpmnModeler,
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

  private tempObject: IFlowElement;

  public activate(model: IPageModel): void {
    this.eventBus = model.modeler.get('eventBus');
    this.modeler = model.modeler;

    const selectedEvents: Array<IShape> = this.modeler.get('selection')._selectedElements;
    if (selectedEvents[0]) {
      this.businessObjInPanel = selectedEvents[0].businessObject;
      this.init();
    }

    this.eventBus.on(['element.click', 'shape.changed'], (event: IEvent) => {
      this.businessObjInPanel = event.element.businessObject;
      this.init();
    });
  }

  private init(): void {
    this.tempObject = this.businessObjInPanel;
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

  private updateCondition(): void {
    this.businessObjInPanel.conditionExpression.body = this.tempObject.conditionExpression.body;
  }

}
