import {IBpmnModeler,
  IEvent,
  IEventBus,
  IModdleElement,
  IPageModel,
  IPoolElement,
  ISection,
  IShape} from '../../../../../../contracts';

export class PoolSection implements ISection {

  public path: string = '/sections/pool/pool';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IPoolElement;
  private eventBus: IEventBus;
  private modeler: IBpmnModeler;

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
    this.canHandleElement = this.checkElement(this.businessObjInPanel);
  }

  public checkElement(element: IModdleElement): boolean {
    if (element && element.$type === 'bpmn:Participant') {
      return true;
    } else {
      return false;
    }
  }

  private clearVersion(): void {
    this.businessObjInPanel.processRef.versionTag = '';
  }

  private clearId(): void {
    this.businessObjInPanel.processRef.id = '';
  }

  private clearName(): void {
    this.businessObjInPanel.processRef.name = '';
  }

}
