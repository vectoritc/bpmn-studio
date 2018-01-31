import {IBpmnModdle,
  IBpmnModeler,
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

  private eventBus: IEventBus;
  private modeling: IModeling;
  private modeler: IBpmnModeler;
  private moddle: IBpmnModdle;
  private elementInPanel: IShape;

  public businessObjInPanel: IModdleElement;
  public elementDocumentation: string;

  public activate(model: IPageModel): void {
    this.eventBus = model.modeler.get('eventBus');
    this.modeling = model.modeler.get('modeling');
    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;

    const selectedEvents: Array<IShape> = this.modeler.get('selection')._selectedElements;
    if (selectedEvents[0]) {
      this.businessObjInPanel = selectedEvents[0].businessObject;
      this.elementInPanel = selectedEvents[0];
      this.init();
    }

    this.eventBus.on(['element.click', 'shape.changed'], (event: IEvent) => {
      this.elementInPanel = event.element;
      this.businessObjInPanel = event.element.businessObject;
      this.init();
    });
  }

  private init(): void {
    if (this.businessObjInPanel.documentation && this.businessObjInPanel.documentation.length > 0) {
      this.elementDocumentation = this.businessObjInPanel.documentation[0].text;
    } else {
      this.elementDocumentation = '';
    }
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
    this.businessObjInPanel.documentation = [];

    const documentation: IModdleElement = this.moddle.create('bpmn:Documentation',
    { text: this.elementDocumentation });
    this.businessObjInPanel.documentation.push(documentation);

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
    this.elementDocumentation = '';
    this.updateDocumentation();
  }

}
