import {
  IBpmnModdle,
  IBpmnModeler,
  IElementRegistry,
  IExtensionElement,
  IForm,
  IFormElement,
  IModdleElement,
  IPageModel,
  ISection,
  IShape,
} from '../../../../../../contracts';

import {inject} from 'aurelia-framework';
import {ValidateEvent, ValidationController, ValidationRules} from 'aurelia-validation';

@inject(ValidationController)
export class BasicsSection implements ISection {

  public path: string = '/sections/basics/basics';
  public canHandleElement: boolean = true;
  private isFormSelected: boolean = false;

  private businessObjInPanel: IFormElement;
  private moddle: IBpmnModdle;
  private modeler: IBpmnModeler;

  private forms: Array<IForm>;
  private selectedForm: IForm;
  private selectedIndex: number;
  private selectedType: string;
  private types: Array<string> = ['string', 'long', 'boolean', 'date', 'enum', 'custom type'];
  private customType: string;
  private formElement: IFormElement;

  private fallbackId: string;
  private validationError: boolean = false;
  private validationController: ValidationController;

  private activeListElementId: string;

  constructor(controller?: ValidationController) {
    this.validationController = controller;
  }

  public activate(model: IPageModel): void {
    this.businessObjInPanel = model.elementInPanel.businessObject;

    this.modeler = model.modeler;
    this.moddle = this.modeler.get('moddle');

    this.validationController.subscribe((event: ValidateEvent) => {
      this.validateFormId(event);
    });

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

  private resetId(): void {
    this.selectedForm.id = this.fallbackId;
    this.validationController.validate();
  }

  private selectForm(): void {
    this.fallbackId = this.selectedForm.id;

    this.isFormSelected = true;
    this.selectedType = this.getTypeOrCustomType(this.selectedForm.type);
    this.selectedIndex = this.getSelectedIndex();

    this.setValidationRules();
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

  private getTypeOrCustomType(type: string): string {
    if (this.types.includes(type) || type === null) {
      this.customType = '';
      return type;
    } else {
      this.customType = type;
      return 'custom type';
    }
  }

  private updateId(): void {
    this.validationController.validate();
    if (this.validationController.errors.length > 0) {
      this.resetId();
    }

    this.formElement.fields[this.selectedIndex].id = this.selectedForm.id;
  }

  private updateDefaultValue(): void {
    this.formElement.fields[this.selectedIndex].label = this.selectedForm.label;
  }

  private updateLabel(): void {
    this.formElement.fields[this.selectedIndex].defaultValue = this.selectedForm.defaultValue;
  }

  private updateType(): void {
    let type: string;

    if (this.selectedType === 'custom type') {
      type = this.customType;
    } else {
      type = this.selectedType;
    }

    this.formElement.fields[this.selectedIndex].type = type;
  }

  private removeForm(): void {
    this.formElement.fields.splice(this.selectedIndex, 1);

    this.isFormSelected = false;
    this.selectedForm = undefined;
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
    this.selectedForm = bpmnForm;

    this.selectForm();
  }

  private getSelectedIndex(): number {
    const forms: Array<IForm> = this.formElement.fields;
    for (let index: number = 0; index < forms.length; index++) {
      if (forms[index].id === this.selectedForm.id) {
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
    this.selectedForm.id = '';

    this.validationController.validate();
    this.updateId();
  }

  private clearType(): void {
    this.customType = '';
  }

  private clearLabel(): void {
    this.selectedForm.label = '';
  }

  private clearValue(): void {
    this.selectedForm.defaultValue = '';
  }

  private validateFormId(event: ValidateEvent): void {
    if (event.type !== 'validate') {
      return;
    }

    this.validationError = false;
    for (const result of event.results) {
      if (result.rule.property.displayName !== 'formId') {
        continue;
      }

      if (result.valid === false) {
        this.validationError = true;
        document.getElementById(result.rule.property.displayName).style.border = '2px solid red';
      } else {
        document.getElementById(result.rule.property.displayName).style.border = '2px solid green';
      }
    }
  }

  private isIdUnique(id: string): boolean {
    const elementRegistry: IElementRegistry = this.modeler.get('elementRegistry');
    const formsWithSameId: Array<IShape> =  elementRegistry.filter((element: IShape) => {
      const currentElement: IModdleElement = element.businessObject;
      if (currentElement.$type === 'bpmn:UserTask' && currentElement.extensionElements) {
        const extensionElements: Array<IFormElement> = currentElement.extensionElements.values;
        for (const extension of extensionElements) {
          if (extension.$type === 'camunda:FormData') {
            const currentForms: Array<IForm> = extension.fields;
            for (const form of currentForms) {
              if (form.id === this.selectedForm.id) {
                if (form !== this.selectedForm) {
                  return true;
                }
              }
            }
          }
        }
      }
      return false;
    });

    return formsWithSameId.length === 0;
  }

  private setValidationRules(): void {
    ValidationRules
      .ensure((form: IForm) => form.id)
      .displayName('formId')
      .required()
      .withMessage(`Id cannot be blank.`)
      .then()
      .satisfies((id: string) => this.isIdUnique(id))
      .withMessage(`Id already exists.`)
      .on(this.selectedForm);
  }
}
