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
  private modeler: IBpmnModeler;

  public activate(model: IPageModel): void {
    this.businessObjInPanel = model.elementInPanel.businessObject;
    this.modeler = model.modeler;
  }

  public checkElement(element: IShape): boolean {
    if (element &&
        element.businessObject &&
        element.businessObject.$type === 'bpmn:Participant') {
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
