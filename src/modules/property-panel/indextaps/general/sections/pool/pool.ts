import {IBpmnModdle,
  IBpmnModeler,
  IBpmnModelerConstructor,
  IEvent,
  IEventBus,
  IModdleElement,
  IModeling,
  IPageModel,
  IProcessRef,
  ISection,
  IShape} from '../../../../../../contracts';

export class PoolSection implements ISection {

  public path: string = '/sections/pool/pool';
  public canHandleElement: boolean = false;

  private elementInPanel: IShape;
  private businessObjInPanel: IModdleElement;
  private processRefInPanel: IProcessRef;
  private eventBus: IEventBus;
  private modeling: IModeling;
  private moddle: IBpmnModdle;

  public activate(model: IPageModel): void {
    this.eventBus = model.modeler.get('eventBus');
    this.modeling = model.modeler.get('modeling');
    this.moddle = model.modeler.get('moddle');

    this.eventBus.on('element.click', (event: IEvent) => {
      this.elementInPanel = event.element;
      this.businessObjInPanel = event.element.businessObject;
      this.processRefInPanel = this.businessObjInPanel.processRef;
      this.checkElement();
    });
  }

  private checkElement(): void {
    if (this.businessObjInPanel && this.businessObjInPanel.$type === 'bpmn:Participant') {
      this.canHandleElement = true;
    } else {
      this.canHandleElement = false;
    }
  }

  private updateVersionTag(): void {
    this.modeling.updateProperties(this.elementInPanel, {
      versionTag: this.processRefInPanel.versionTag,
    });
  }

  private updateProcessId(): void {
    this.businessObjInPanel.processRef.id = this.processRefInPanel.id;
  }

  private updateProcessName(): void {
    this.businessObjInPanel.processRef.name = this.processRefInPanel.name;
  }

}
