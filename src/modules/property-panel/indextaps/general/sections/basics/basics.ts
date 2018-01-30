import {IBpmnModeler,
  IBpmnModelerConstructor,
  IEvent,
  IEventBus,
  IModdleElement,
  IModeling,
  IPageModel,
  ISection,
  IShape} from '../../../../../../contracts';

export class BasicsSection implements ISection {

  public path: string = '/sections/basics/basics';
  public canHandleElement: boolean = true;

  private elementInPanel: IShape;
  private businessObjInPanel: IModdleElement;
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
      this.elementInPanel = selectedEvents[0];
    }

    this.eventBus.on(['element.click', 'shape.changed'], (event: IEvent) => {
      this.elementInPanel = event.element;
      this.businessObjInPanel = event.element.businessObject;
    });
  }

  public checkElement(element: IModdleElement): boolean {
    return true;
  }

  private updateName(): void {
    this.modeling.updateProperties(this.elementInPanel, {
      name: this.businessObjInPanel.name,
    });
  }

  private updateId(): void {
    this.modeling.updateProperties(this.elementInPanel, {
      id: this.businessObjInPanel.id,
    });
  }

  private updateDocumentation(): void {
    this.modeling.updateProperties(this.elementInPanel, {
      documentation: this.businessObjInPanel.documentation,
    });
  }

  public clearId(): void {
    this.businessObjInPanel.id = '';
  }

  public clearName(): void {
    this.businessObjInPanel.name = '';
  }

  public clearDocumentation(): void {
    this.businessObjInPanel.documentation = '';
  }

}
