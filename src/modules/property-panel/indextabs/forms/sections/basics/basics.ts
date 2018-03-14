import {
  IBpmnModdle,
  IBpmnModeler,
  IElementRegistry,
  IExtensionElement,
  IForm,
  IFormElement,
  IModdleElement,
  IPageModel,
  IPropertyElement,
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
  private bpmnModdle: IBpmnModdle;
  private modeler: IBpmnModeler;

  private forms: Array<IForm>;
  private selectedForm: IForm;
  private selectedIndex: number;
  private selectedType: string;
  private types: Array<string> = ['string', 'long', 'boolean', 'date', 'enum', 'custom type'];
  private customType: string;
  private formElement: IFormElement;

  private previousFormId: string;
  private previousForm: IForm;
  private validationError: boolean = false;
  private validationController: ValidationController;

  private activeListElementId: string;

  constructor(controller?: ValidationController) {
    this.validationController = controller;
  }

  public activate(model: IPageModel): void {
    this.businessObjInPanel = model.elementInPanel.businessObject;

    this.modeler = model.modeler;
    this.bpmnModdle = this.modeler.get('moddle');

    this.validationController.subscribe((event: ValidateEvent) => {
      this._validateFormId(event);
    });

    this._init();

    if (this.validationError) {
      this.previousForm.id = this.previousFormId;
      this.validationController.validate();
    }
  }

  public detached(): void {
    this._validateOnDetach();
  }

  public isSuitableForElement(element: IShape): boolean {

    const elementHasNoBusinessObject: boolean = element.businessObject === undefined
                                             || element.businessObject === null;

    if (elementHasNoBusinessObject) {
      return false;
    }

    return element.businessObject.$type === 'bpmn:UserTask';
  }

  public removeSelectedForm(): void {
    this.formElement.fields.splice(this.selectedIndex, 1);

    this.isFormSelected = false;
    this.selectedForm = undefined;
    this.selectedIndex = undefined;

    this._reloadForms();
  }

  public clearFormKey(): void {
    this.businessObjInPanel.formKey = '';
  }

  public async addForm(): Promise<void> {

    const bpmnFormObject: IForm =  {
      id: `Form_${this._generateRandomId()}`,
      type: null,
      label: '',
      defaultValue: '',
    };
    const bpmnForm: IForm = this.bpmnModdle.create('camunda:FormField', bpmnFormObject);

    if (this.formElement.fields === undefined || this.formElement.fields === null) {
      this.formElement.fields = [];
    }

    this.formElement.fields.push(bpmnForm);
    this.forms.push(bpmnForm);
    this.selectedForm = bpmnForm;

    this.selectForm();
  }

  public updateId(): void {
    this.validationController.validate();

    const hasValidationErrors: boolean = this.validationController.errors.length > 0;
    if (hasValidationErrors) {
      this._resetId();
    }

    const isSelectedFormIdNotExisting: boolean = this.selectedForm === null || this.selectedForm.id === '';
    if (isSelectedFormIdNotExisting) {
      return;
    }

    this.formElement.fields[this.selectedIndex].id = this.selectedForm.id;
  }

  public clearId(): void {
    this.selectedForm.id = '';
    this.validationController.validate();
    this.updateId();
    this.validationController.validate();
  }

  public selectForm(): void {
    if (this.validationError) {
      this.previousForm.id = this.previousFormId;
    }

    this.previousFormId = this.selectedForm.id;
    this.previousForm = this.selectedForm;

    this.validationController.validate();

    this.isFormSelected = true;
    this.selectedType = this._getTypeAndHandleCustomType(this.selectedForm.type);
    this.selectedIndex = this._getSelectedIndex();

    this._setValidationRules();
  }

  public updateType(): void {
    let type: string;

    if (this.selectedType === 'custom type') {
      type = this.customType;
    } else {
      type = this.selectedType;
    }

    this.formElement.fields[this.selectedIndex].type = type;
  }

  public clearType(): void {
    this.customType = '';
  }

  public updateLabel(): void {
    this.formElement.fields[this.selectedIndex].label = this.selectedForm.label;
  }

  public clearLabel(): void {
    this.selectedForm.label = '';
  }

  public updateDefaultValue(): void {
    this.formElement.fields[this.selectedIndex].defaultValue = this.selectedForm.defaultValue;
  }

  public clearValue(): void {
    this.selectedForm.defaultValue = '';
  }

  private _validateOnDetach(): void {
    if (!this.validationError) {
      return;
    }

    const bpmnFormFieldObject: IForm = {
      id: `Form_${this._generateRandomId()}`,
      type: null,
      label: '',
      defaultValue: '',
    };
    const bpmnForm: IForm = this.bpmnModdle.create('camunda:FormField', bpmnFormFieldObject);

    if (this.formElement.fields === undefined || this.formElement.fields === null) {
      this.formElement.fields = [];
    }

    this._resetIdOnSelectedOrPrevious();

    this.validationController.validate();
    this.updateId();
  }

  private _resetIdOnSelectedOrPrevious(): void {
    if (this.selectedForm !== null) {
      this.selectedForm.id = this.previousFormId;
    } else {
      this.previousForm.id = this.previousFormId;
    }
  }

  private _init(): void {
    this.isFormSelected = false;
    if (this.canHandleElement) {
      this.formElement = this._getOrCreateFormElement();
      this._reloadForms();
    }
  }

  private _resetId(): void {
    this._resetIdOnSelectedOrPrevious();

    this.validationController.validate();
  }

  private _reloadForms(): void {
    this.forms = [];

    const noFormFieldsExist: boolean = this.formElement === undefined
                                    || this.formElement === null
                                    || this.formElement.fields === undefined
                                    || this.formElement.fields === null
                                    || this.formElement.fields.length === 0;
    if (noFormFieldsExist) {
      return;
    }

    this.forms = this.formElement.fields.filter((form: IForm) => {
      const formIsFormField: boolean = form.$type === 'camunda:FormField';

      return formIsFormField;
    });
  }

  private _getTypeAndHandleCustomType(type: string): string {
    const typeIsRegularType: boolean = this.types.includes(type) || type === null;

    if (typeIsRegularType) {
      this.customType = '';
      return type;
    }

    this.customType = type;
    return 'custom type';
  }

  private _getSelectedIndex(): number {
    return this.formElement.fields.findIndex((form: IForm) => {
      const formIsSelectedForm: boolean = form.id === this.selectedForm.id;

      return formIsSelectedForm;
    });
  }

  private _getOrCreateFormElement(): IModdleElement {
    const elementHasNoExtensionsElement: boolean = this.businessObjInPanel.extensionElements === undefined
                                                || this.businessObjInPanel.extensionElements === null;

    if (elementHasNoExtensionsElement) {
      this._createExtensionElement();
    }

    const extensionsValues: Array<IModdleElement> = this.businessObjInPanel.extensionElements.values;

    const formElement: IModdleElement = extensionsValues.find((extensionValue: IModdleElement) => {
      const extensionIsValidForm: boolean = extensionValue.$type === 'camunda:FormData';

      return extensionIsValidForm;
    });

    if (formElement === undefined) {
      this._createEmptyExtensionsElement();
      return this._getOrCreateFormElement();
    }

    return formElement;
  }

  private _createExtensionElement(): void {
    const values: Array<IFormElement> = [];
    const fields: Array<IForm> = [];
    const formData: IFormElement = this.bpmnModdle.create('camunda:FormData', {fields: fields});
    values.push(formData);

    this.businessObjInPanel.formKey = 'Form Key';
    const extensionElements: IModdleElement = this.bpmnModdle.create('bpmn:ExtensionElements', {values: values});
    this.businessObjInPanel.extensionElements = extensionElements;
  }

  private _createEmptyExtensionsElement(): void {
    const fields: Array<IModdleElement> = [];
    const extensionFormElement: IModdleElement = this.bpmnModdle.create('camunda:FormData', {fields: fields});
    this.businessObjInPanel.extensionElements.values.push(extensionFormElement);
  }

  private _generateRandomId(): string {
    let randomId: string = '';
    const possible: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    const randomIdLength: number = 8;
    for (let i: number = 0; i < randomIdLength; i++) {
      randomId += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return randomId;
  }

  private _deleteExtensions(): void {
    delete this.businessObjInPanel.extensionElements;
    delete this.businessObjInPanel.formKey;
  }

  private _validateFormId(event: ValidateEvent): void {
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
        document.getElementById(result.rule.property.displayName).style.border = '';
      }
    }
  }

  private _hasFormSameIdAsSelected(forms: Array<IForm>): boolean {

    const unselectedFormWithSameId: IForm = forms.find((form: IForm) => {

      const formHasSameIdAsSelectedForm: boolean = form.id === this.selectedForm.id;
      const formIsNotSelectedForm: boolean = form !== this.selectedForm;

      return formHasSameIdAsSelectedForm && formIsNotSelectedForm;
    });

    return unselectedFormWithSameId !== undefined;
  }

  private _getFormDataFromBusinessObject(businessObject: IModdleElement): IFormElement {
    const extensionElement: IExtensionElement = businessObject.extensionElements;
    const hasNoExtensionElements: boolean = extensionElement === undefined;
    if (hasNoExtensionElements) {
      return;
    }

    const extensions: Array<IModdleElement> = extensionElement.values;
    return extensions.find((extension: IModdleElement) => {
      const isFormData: boolean = extension.$type === 'camunda:FormData';

      return isFormData;
    });
  }

  private _getFormsById(id: string): Array<IShape> {
    const elementRegistry: IElementRegistry = this.modeler.get('elementRegistry');

    const formsWithId: Array<IShape> = elementRegistry.filter((element: IShape) => {
      const currentBusinessObject: IModdleElement = element.businessObject;

      const isNoUserTask: boolean = currentBusinessObject.$type !== 'bpmn:UserTask';
      if (isNoUserTask) {
        return false;
      }
      const formData: IFormElement = this._getFormDataFromBusinessObject(currentBusinessObject);
      if (formData === undefined) {
        return false;
      }

      const forms: Array<IForm> = formData.fields;

      return this._hasFormSameIdAsSelected(forms);
    });

    return formsWithId;
  }

  private _formIdIsUnique(id: string): boolean {
    const formsWithSameId: Array<IShape> = this._getFormsById(id);
    const isIdUnique: boolean = formsWithSameId.length === 0;

    return isIdUnique;
  }

  private _setValidationRules(): void {
    ValidationRules
      .ensure((form: IForm) => form.id)
      .displayName('formId')
      .required()
      .withMessage('Id cannot be blank.')
      .then()
      .satisfies((id: string) => this._formIdIsUnique(id))
      .withMessage('Id already exists.')
      .on(this.selectedForm);
  }
}
