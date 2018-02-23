import {IBpmnModdle,
  IBpmnModeler,
  IBpmnModelerConstructor,
  IDefinition,
  IEvent,
  IEventBus,
  IForm,
  IFormElement,
  IModdleElement,
  IModeling,
  IPageModel,
  ISection,
  IShape} from '../../../../../../contracts';

export class BasicsSection implements ISection {

  public path: string = '/sections/basics/basics';
  public canHandleElement: boolean = true;
  private isFormSelected: boolean = false;

  private businessObjInPanel: IFormElement;
  private moddle: IBpmnModdle;
  private modeler: IBpmnModeler;

  private forms: Array<IForm>;
  private selectedForms: Array<IForm>;
  private selectedIndex: number;
  private types: Array<string> = ['string', 'long', 'boolean', 'date', 'enum', 'custom type'];
  private customType: string;
  private formElement: IFormElement;

  private activeListElementId: string;

  public async activate(model: IPageModel): Promise<void> {
    this.businessObjInPanel = model.elementInPanel.businessObject;

    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;

    this.init();
  }

  public isSuitableForElement(element: IShape): boolean {
    if (!element.businessObject) {
      return false;
    }

    return element.businessObject.$type === 'bpmn:UserTask';
  }

  private init(): void {
    this.isFormSelected = false;
    if (this.canHandleElement) {
      this.formElement = this.getFormElement();
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

  private selectForm(): void {
    this.isFormSelected = true;
    this.selectedIndex = this.getSelectedIndex();
  }

  private reloadForms(): void {
    this.forms = [];

    if (!this.formElement || !this.formElement.fields) {
      return;
    }

    const forms: Array<IForm> = this.formElement.fields;
    for (const form of forms) {
      if (form.$type === `camunda:FormField`) {
        this.forms.push(form);
      }
    }
  }

  private updateId(): void {
    this.formElement.fields[this.selectedIndex].id = this.selectedForms[0].id;
  }

  private updateDefaultValue(): void {
    this.formElement.fields[this.selectedIndex].label = this.selectedForms[0].label;
  }

  private updateLabel(): void {
    this.formElement.fields[this.selectedIndex].defaultValue = this.selectedForms[0].defaultValue;
  }

  private updateType(): void {
    this.formElement.fields[this.selectedIndex].type = this.selectedForms[0].type;
  }

  private async removeForm(): Promise<void> {
    this.formElement.fields.splice(this.selectedIndex, 1);
    this.isFormSelected = false;
    this.selectedForms = undefined;
    this.selectedIndex = undefined;
    this.reloadForms();
  }

  private async addForm(): Promise<void> {

    const bpmnForm: IForm = this.moddle.create('camunda:FormField',
      {
        id: `Form_${this.generateRandomId()}`,
        type: null,
        label: ``,
        defaultValue: ``,
      });

    if (!this.formElement.fields) {
      this.formElement.fields = [];
    }

    this.formElement.fields.push(bpmnForm);
    this.forms.push(bpmnForm);
  }

  private getSelectedIndex(): number {
    const forms: Array<IForm> = this.formElement.fields;
    for (let index: number = 0; index < forms.length; index++) {
      if (forms[index].id === this.selectedForms[0].id) {
        return index;
      }
    }
  }

  private getFormElement(): IModdleElement {
    let formElement: IModdleElement;

    if (!this.businessObjInPanel.extensionElements) {
      this.createExtensionElement();
    }

    for (const extensionValue of this.businessObjInPanel.extensionElements.values) {
      if (extensionValue.$type === 'camunda:FormData') {
        formElement = extensionValue;
      }
    }

    if (!formElement) {
      const fields: Array<IModdleElement> = [];
      const extensionFormElement: IModdleElement = this.moddle.create('camunda:FormData', {fields: fields});
      this.businessObjInPanel.extensionElements.values.push(extensionFormElement);

      return this.getFormElement();
    }

    return formElement;
  }

  private createExtensionElement(): void {
    const values: Array<IFormElement> = [];
    const fields: Array<IForm> = [];
    const formData: IFormElement = this.moddle.create('camunda:FormData', {fields: fields});
    values.push(formData);

    this.businessObjInPanel.formKey = `Form Key`;
    const extensionElements: IModdleElement = this.moddle.create('bpmn:ExtensionElements', {values: values});
    this.businessObjInPanel.extensionElements = extensionElements;
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

  private deleteExtensions(): void {
    delete this.businessObjInPanel.extensionElements;
    delete this.businessObjInPanel.formKey;
  }

  private clearFormKey(): void {
    this.businessObjInPanel.formKey = '';
  }

  private clearId(): void {
    this.selectedForms[0].id = '';
  }

  private clearType(): void {
    this.customType = '';
  }

  private clearLabel(): void {
    this.selectedForms[0].label = '';
  }

  private clearValue(): void {
    this.selectedForms[0].defaultValue = '';
  }

}
