import {IBpmnModdle,
  IBpmnModeler,
  IBpmnModelerConstructor,
  IEvent,
  IEventBus,
  IModdleElement,
  IModeling,
  IPageModel,
  ISection} from '../../../../../../contracts';

export class BasicsSection implements ISection {

  public path: string = '/sections/basics/basics';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IModdleElement;
  private eventBus: IEventBus;
  private moddle: IBpmnModdle;
  private modeling: IModeling;
  private modeler: IBpmnModeler;

  private properties: Array<any> = [];
  private tempObject: IModdleElement;

  public async activate(model: IPageModel): Promise<void> {
    this.eventBus = model.modeler.get('eventBus');
    this.moddle = model.modeler.get('moddle');
    this.modeling = model.modeler.get('modeling');
    this.modeler = model.modeler;

    const selectedEvents: any = this.modeler.get('selection')._selectedElements;
    if (selectedEvents[0]) {
      this.businessObjInPanel = selectedEvents[0].businessObject;
      this.init();
    }

    this.eventBus.on('element.click', (event: IEvent) => {
      this.businessObjInPanel = event.element.businessObject;
      this.init();
    });
  }

  private init(): void {
    this.tempObject = this.businessObjInPanel;
    this.reloadForm();
  }

  private async addForm(): Promise<void> {
    const bpmnProperty: IModdleElement = this.moddle.create('camunda:Property',
                                                        { name: '',
                                                          value: '',
                                                        });

    const bpmnExecutionListener: IModdleElement = this.moddle.create('camunda:ExecutionListener',
                                                                { class: '',
                                                                  event: '',
                                                                });

    if (!this.businessObjInPanel.extensionElements) {
      const extensionValues: Array<IModdleElement> = [];
      const values2: Array<IModdleElement> = [];
      const properties: IModdleElement = this.moddle.create('camunda:Properties', {values: values2});
      extensionValues.push(bpmnExecutionListener);
      extensionValues.push(properties);

      const extensionElements: IModdleElement = this.moddle.create('bpmn:ExtensionElements', {values: extensionValues});
      this.businessObjInPanel.extensionElements = extensionElements;
    }

    this.businessObjInPanel.extensionElements.values[1].values.push(bpmnProperty);
    this.properties.push(bpmnProperty);
}

  private deleteForm(index: number): void {
    // this.businessObjInPanel.extensionElements.values[1].values.splice(index, 1);
    // this.reloadForm();
  }

  private reloadForm(): void {
    this.properties = [];
    if (this.businessObjInPanel.extensionElements === undefined || !this.businessObjInPanel.extensionElements.values) {
      return;
    }

    const forms: any = this.businessObjInPanel.extensionElements.values[1].values;
    for (const form of forms) {
      if (form.$type === `camunda:Property`) {
        this.properties.push(form);
      }
    }
  }

  private changeName(index: number): void {
    this.businessObjInPanel.extensionElements.values[1].values[index].name = this.tempObject.extensionElements.values[1].values[index].name;
  }

  private changeValue(index: number): void {
    this.businessObjInPanel.extensionElements.values[1].values[index].value = this.tempObject.extensionElements.values[1].values[index].value;
  }

  public checkElement(element: IModdleElement): boolean {
    return true;
  }

}
