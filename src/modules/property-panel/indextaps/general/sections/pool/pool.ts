import {IBpmnModeler,
  IEvent,
  IEventBus,
  IModdleElement,
  IModeling,
  IPageModel,
  IProcessRef,
  ISection} from '../../../../../../contracts';

export class PoolSection implements ISection {

  public path: string = '/sections/pool/pool';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IModdleElement;
  private processRefInPanel: IProcessRef;
  private eventBus: IEventBus;
  private modeling: IModeling;
  private modeler: IBpmnModeler;

  public activate(model: IPageModel): void {
    this.eventBus = model.modeler.get('eventBus');
    this.modeling = model.modeler.get('modeling');
    this.modeler = model.modeler;

    const selectedEvents: any = this.modeler.get('selection')._selectedElements;
    if (selectedEvents[0]) {
      this.businessObjInPanel = selectedEvents[0].businessObject;
      this.init();
    }

    this.eventBus.on('element.click', (event: IEvent) => {
      this.businessObjInPanel = event.element.businessObject;
    });
  }

  private init(): void {
    this.processRefInPanel = this.businessObjInPanel.processRef;
    this.canHandleElement = this.checkElement(this.businessObjInPanel);
  }

  public checkElement(element: IModdleElement): boolean {
    if (element && element.$type === 'bpmn:Participant') {
      return true;
    } else {
      return false;
    }
  }

  private updateVersionTag(): void {
    this.businessObjInPanel.processRef.versionTag = this.processRefInPanel.versionTag;
  }

  private updateProcessId(): void {
    this.businessObjInPanel.processRef.id = this.processRefInPanel.id;
  }

  private updateProcessName(): void {
    this.businessObjInPanel.processRef.name = this.processRefInPanel.name;
  }

}
