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

  public isSuitableForElement(element: IShape): boolean {
    return this.elementIsParticipant(element);
  }

  private elementIsParticipant(element: IShape): boolean {
    return element !== undefined
        && element.businessObject !== undefined
        && element.businessObject.$type === 'bpmn:Participant';
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
