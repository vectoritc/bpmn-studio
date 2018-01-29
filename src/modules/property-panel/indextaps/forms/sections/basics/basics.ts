import {IBpmnModdle,
  IBpmnModeler,
  IBpmnModelerConstructor,
  IDefinition,
  IEvent,
  IEventBus,
  IModdleElement,
  IModeling,
  IPageModel,
  ISection,
  IShape} from '../../../../../../contracts';
import { PropertyPanel } from './../../../../property-panel';

export class BasicsSection implements ISection {

  public path: string = '/sections/basics/basics';
  public canHandleElement: boolean = false;
  private isFormSelected: boolean = false;

  private businessObjInPanel: IModdleElement;
  private eventBus: IEventBus;
  private moddle: IBpmnModdle;
  private modeler: IBpmnModeler;
  private propertyPanel: PropertyPanel;

  private forms: Array<IModdleElement>;
  private selectedForm: IModdleElement;
  private selectedIndex: number;
  private types: Array<string> = ['string', 'long', 'boolean', 'date', 'enum', 'custom type'];
  private selectedType: string;
  private customType: string;

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
    this.isFormSelected = false;
    this.canHandleElement = this.checkElement(this.businessObjInPanel);
    if (this.canHandleElement) {
      this.reloadForms();
    }
  }

  private getXML(): string {
    let xml: string;
    this.modeler.saveXML({format: true}, (err: Error, diagrammXML: string) => {
      xml = diagrammXML;
    });
    return xml;
  }

  private selectForm(form: IModdleElement): void {
    this.selectedForm = form;
    this.selectedType = this.getTypeOrCustomType(form.type);
    this.selectedIndex = this.getSelectedIndex();
    this.isFormSelected = true;
  }

  private reloadForms(): void {
    this.forms = [];
    if (!this.businessObjInPanel.extensionElements || !this.businessObjInPanel.extensionElements.values) {
      return;
    }

    const forms: any = this.businessObjInPanel.extensionElements.values[0].fields;
    for (const form of forms) {
      if (form.$type === `camunda:FormField`) {
        this.forms.push(form);
      }
    }
  }

  public checkElement(element: IModdleElement): boolean {
    if (element.$type === 'bpmn:UserTask' || element.$type === 'bpmn:StartEvent') {
      return true;
    } else {
      return false;
    }
  }

  private updateId(): void {
    this.businessObjInPanel.extensionElements.values[0].fields[this.selectedIndex].id = this.selectedForm.id;
  }

  private updateDefaultValue(): void {
    this.businessObjInPanel.extensionElements.values[0].fields[this.selectedIndex].label = this.selectedForm.label;
  }

  private updateLabel(): void {
    this.businessObjInPanel.extensionElements.values[0].fields[this.selectedIndex].defaultValue = this.selectedForm.defaultValue;
  }

  private updateType(): void {
    let type: string;

    if (this.selectedType === `custom type`) {
      type = this.customType;
    } else {
      type = this.selectedType;
    }

    this.businessObjInPanel.extensionElements.values[0].fields[this.selectedIndex].type = type;
  }

  private async removeForm(): Promise<void> {
    this.businessObjInPanel.extensionElements.values[0].fields.splice(this.selectedIndex, 1);
    this.isFormSelected = false;
    this.selectedForm = undefined;
    this.selectedIndex = undefined;
    this.selectedType = undefined;
    this.reloadForms();
  }

  private async addForm(): Promise<void> {
      const bpmnForm: IModdleElement = this.moddle.create('camunda:FormField',
                                                          { id: `Form_${this.generateRandomId()}`,
                                                            type: null,
                                                            label: `Form Label`,
                                                            defaultValue: `Default Value`,
                                                          });

      if (!this.businessObjInPanel.extensionElements) {
        const values: Array<IModdleElement> = [];
        const fields: Array<IModdleElement> = [];
        const formData: IModdleElement = this.moddle.create('camunda:FormData', {fields: fields});
        values.push(formData);

        this.businessObjInPanel.formKey = `Form Key`;
        const extensionElements: IModdleElement = this.moddle.create('bpmn:ExtensionElements', {values: values});
        this.businessObjInPanel.extensionElements = extensionElements;
      }

      this.businessObjInPanel.extensionElements.values[0].fields.push(bpmnForm);
      this.forms.push(bpmnForm);
      this.selectForm(bpmnForm);
  }

  private getTypeOrCustomType(type: string): string {
    if (this.types.includes(type) || type === null) {
      this.customType = '';
      return type;
    } else {
      this.customType = type;
      return 'custom type';
    }
  }

  private getSelectedIndex(): number {
    const forms: Array<IModdleElement> = this.businessObjInPanel.extensionElements.values[0].fields;
    for (let index: number = 0; index < forms.length; index++) {
      if (forms[index].id === this.selectedForm.id) {
        return index;
      }
    }
  }

  private generateRandomId(): string {
    let randomId: string = '';
    const possible: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    const randomIdLength: number = 8;
    for (let i: number = 0; i < randomIdLength; i++) {
      randomId += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return randomId;
  }
}
