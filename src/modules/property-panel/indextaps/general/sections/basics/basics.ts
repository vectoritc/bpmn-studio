import {IBpmnModdle,
  IBpmnModeler,
  IDefinition,
  IElementRegistry,
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

    this.eventBus.on(['element.click', 'shape.changed', 'selection.changed'], (event: IEvent) => {
      if (event.newSelection && event.newSelection.length !== 0) {
        this.elementInPanel = event.newSelection[0];
        this.businessObjInPanel = event.newSelection[0].businessObject;
      } else if (event.element) {
        this.elementInPanel = event.element;
        this.businessObjInPanel = event.element.businessObject;
      }
      this.init();
    });
    this.setFirstElement();
  }

  private init(): void {
    if (this.businessObjInPanel.documentation && this.businessObjInPanel.documentation.length > 0) {
      this.elementDocumentation = this.businessObjInPanel.documentation[0].text;
    } else {
      this.elementDocumentation = '';
    }
  }

  private setFirstElement(): void {
    const selectedEvents: Array<IShape> = this.modeler.get('selection')._selectedElements;
    if (selectedEvents[0]) {
      return;
    } else {
      const rootElements: any = this.modeler._definitions.rootElements;
      const process: IModdleElement = rootElements.find((element: any ) =>  {
        return element.$type === 'bpmn:Process';
      });

      const startEvent: IModdleElement = process.flowElements.find((element: any ) => {
        return element.$type === 'bpmn:StartEvent';
      });
      if (startEvent.$type !== 'bpmn:StartEvent') {
        startEvent.id = process.flowElements[0].id;
      }

      const elementRegistry: IElementRegistry = this.modeler.get('elementRegistry');
      const elementInPanel: IShape = elementRegistry.get(startEvent.id);

      this.modeler.get('selection').select(elementInPanel);
    }
  }

  private getXML(): string {
    let xml: string;
    this.modeler.saveXML({format: true}, (err: Error, diagrammXML: string) => {
      xml = diagrammXML;
    });
    return xml;
  }

  public checkElement(element: IModdleElement): boolean {
    return true;
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
