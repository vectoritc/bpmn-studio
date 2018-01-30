import {IBpmnModdle,
  IBpmnModeler,
  IEvent,
  IEventBus,
  IModdleElement,
  IPageModel,
  ISection} from '../../../../../../contracts';

export class BasicsSection implements ISection {

  public path: string = '/sections/basics/basics';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IModdleElement;
  private eventBus: IEventBus;
  private moddle: IBpmnModdle;
  private modeler: IBpmnModeler;

  private properties: Array<any> = [];
  private selectedElement: IModdleElement;
  private newNames: Array<string> = [];
  private newValues: Array<string> = [];

  public async activate(model: IPageModel): Promise<void> {
    this.eventBus = model.modeler.get('eventBus');
    this.moddle = model.modeler.get('moddle');
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
    this.selectedElement = this.businessObjInPanel;
    this.reloadForm();
  }

  private async addForm(): Promise<void> {
    const bpmnProperty: IModdleElement = this.moddle.create('camunda:Property',
                                                        { name: '',
                                                          value: '',
                                                        });

    if (!this.businessObjInPanel.extensionElements) {
      const bpmnExecutionListener: IModdleElement = this.moddle.create('camunda:ExecutionListener',
                                                                  { class: '',
                                                                    event: '',
                                                                  });

      const extensionValues: Array<IModdleElement> = [];
      const propertyValues: Array<IModdleElement> = [];
      const properties: IModdleElement = this.moddle.create('camunda:Properties', {values: propertyValues});
      extensionValues.push(bpmnExecutionListener);
      extensionValues.push(properties);

      const extensionElements: IModdleElement = this.moddle.create('bpmn:ExtensionElements', {values: extensionValues});
      this.businessObjInPanel.extensionElements = extensionElements;
    } else if (!this.businessObjInPanel.extensionElements.values[1]) {
      const propertyValues: Array<IModdleElement> = [];

      const properties: IModdleElement = this.moddle.create('camunda:Properties', {values: propertyValues});
      this.businessObjInPanel.extensionElements.values[1] = properties;
    }

    this.newNames.push('');
    this.newValues.push('');

    this.businessObjInPanel.extensionElements.values[1].values.push(bpmnProperty);
    this.properties.push(bpmnProperty);
  }

  private deleteForm(index: number): void {
    this.businessObjInPanel.extensionElements.values[1].values.splice(index, 1);
    this.reloadForm();
  }

  private reloadForm(): void {
    this.properties = [];
    this.newNames = [];
    this.newValues = [];

    if (!this.businessObjInPanel.extensionElements ||
<<<<<<< Updated upstream
        this.businessObjInPanel.extensionElements.values ||
        this.businessObjInPanel.extensionElements.values[1]) {
=======
        !this.businessObjInPanel.extensionElements.values ||
        !this.businessObjInPanel.extensionElements.values[1]) {
>>>>>>> Stashed changes
      return;
    }

    const forms: Array<IModdleElement> = this.businessObjInPanel.extensionElements.values[1].values;
    for (const form of forms) {
      if (form.$type === `camunda:Property`) {
        this.newNames.push(form.name);
        this.newValues.push(form.value);
        this.properties.push(form);
      }
    }
  }

  private changeName(index: number): void {
    this.businessObjInPanel.extensionElements.values[1].values[index].name = this.newNames[index];
  }

  private changeValue(index: number): void {
    this.businessObjInPanel.extensionElements.values[1].values[index].value = this.newValues[index];
  }

  public checkElement(element: IModdleElement): boolean {
    return true;
  }

}
