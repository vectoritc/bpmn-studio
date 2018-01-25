import {IEvent,
  IEventBus,
  IModdleElement,
  IPageModel,
  ISection} from '../../../../../../contracts';

export class FlowSection implements ISection {

  public path: string = '/sections/flow/flow';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IModdleElement;
  private eventBus: IEventBus;

  private tempObject: IModdleElement;

  public flowCondition: string;

  public activate(model: IPageModel): void {
    this.eventBus = model.modeler.get('eventBus');

    this.eventBus.on('element.click', (event: IEvent) => {
      this.businessObjInPanel = event.element.businessObject;

      this.tempObject = this.businessObjInPanel;

      this.canHandleElement = this.checkElement(this.businessObjInPanel);
    });
  }

  public checkElement(element: IModdleElement): boolean {
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
