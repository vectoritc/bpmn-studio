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

      this.checkElement();
    });
  }

  private checkElement(): void {
    if (this.businessObjInPanel &&
        this.businessObjInPanel.$type === 'bpmn:SequenceFlow' &&
        this.businessObjInPanel.targetRef.$type === 'bpmn:ExclusiveGateway') {
      this.canHandleElement = true;
    } else {
      this.canHandleElement = false;
    }
  }

  private updateCondition(): void {
    this.businessObjInPanel.conditionExpression.body = this.tempObject.conditionExpression.body;
  }

}
