import {
  IBpmnModdle,
  IBpmnModeler,
  IElementRegistry,
  IModdleElement,
  IModeling,
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
  private modeling: IModeling;
  private modeler: IBpmnModeler;
  private bpmnModdle: IBpmnModdle;
  private elementInPanel: IShape;
  private previousProcessRefId: string;
  private validationError: boolean = false;
  private validationController: ValidationController;

  public businessObjInPanel: IModdleElement;
  public elementDocumentation: string;

  constructor(controller?: ValidationController) {
    this.validationController = controller;
  }

  public activate(model: IPageModel): void {
    if (this.validationError) {
      this.businessObjInPanel.id = this.previousProcessRefId;
      this.validationController.validate();
    }

    this.elementInPanel = model.elementInPanel;
    this.businessObjInPanel = model.elementInPanel.businessObject;
    this.previousProcessRefId = model.elementInPanel.businessObject.id;

    this.modeling = model.modeler.get('modeling');
    this.bpmnModdle = model.modeler.get('moddle');
    this.modeler = model.modeler;

    this.validationController.subscribe((event: ValidateEvent) => {
      this._validateFormId(event);
    });

    this._init();

    this._setValidationRules();
  }

  public detached(): void {
    if (this.validationError) {
      this.businessObjInPanel.id = this.previousProcessRefId;
      this.validationController.validate();
    }
  }

  public isSuitableForElement(element: IShape): boolean {
    if (element === undefined || element === null) {
      return false;
    }

    return true;
  }

  private _init(): void {
    if (!this.businessObjInPanel) {
      return;
    }

    const documentationExists: boolean = this.businessObjInPanel.documentation !== undefined
                                      && this.businessObjInPanel.documentation !== null
                                      && this.businessObjInPanel.documentation.length > 0;

    if (documentationExists) {
      this.elementDocumentation = this.businessObjInPanel.documentation[0].text;
    } else {
      this.elementDocumentation = '';
    }
  }

  private _updateDocumentation(): void {
    this.elementInPanel.documentation = [];

    const documentationPropertyObject: Object = {text: this.elementDocumentation};
    const documentation: IModdleElement = this.bpmnModdle.create('bpmn:Documentation', documentationPropertyObject);
    this.elementInPanel.documentation.push(documentation);

    const elementInPanelDocumentation: Object = {documentation: this.elementInPanel.documentation};
    this.modeling.updateProperties(this.elementInPanel, elementInPanelDocumentation);
  }

  private _clearId(): void {
    this.businessObjInPanel.id = '';
    this.validationController.validate();
    this._updateId();
  }

  private _clearName(): void {
    this.businessObjInPanel.name = '';
    this._updateName();
  }

  private _clearDocumentation(): void {
    this.elementDocumentation = '';
    this._updateDocumentation();
  }

  private _updateName(): void {
    const updateProperty: Object = {name: this.businessObjInPanel.name};
    this.modeling.updateProperties(this.elementInPanel, updateProperty);
  }

  private _updateId(): void {
    this.validationController.validate();

    if (this.validationController.errors.length > 0) {
      return;
    }

    const updateProperty: Object = {id: this.businessObjInPanel.id};
    this.modeling.updateProperties(this.elementInPanel, updateProperty);
  }

  private _validateFormId(event: ValidateEvent): void {
    if (event.type !== 'validate') {
      return;
    }

    this.validationError = false;
    for (const result of event.results) {
      if (result.rule.property.displayName !== 'elementId') {
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

  private _formIdIsUnique(id: string): boolean {
    const elementRegistry: IElementRegistry = this.modeler.get('elementRegistry');

    const elementsWithSameId: Array<IShape> = elementRegistry.filter((element: IShape) => {
      const elementIsBusinessObjectInPanel: boolean = element.businessObject === this.businessObjInPanel;
      if (elementIsBusinessObjectInPanel) {
        return false;
      }

      const elementIsOfTypeLabel: boolean = element.type === 'label';
      if (elementIsOfTypeLabel) {
        return false;
      }

      const elementHasSameId: boolean = element.businessObject.id === this.businessObjInPanel.id;

      return elementHasSameId;
    });

    return elementsWithSameId.length === 0;
  }

  private _isProcessIdUnique(id: string): boolean {
    const elementIds: Array<string> = this.modeler._definitions.rootElements.map((rootElement: IModdleElement) => {
      return rootElement.id;
    });

    return !elementIds.includes(id);
  }

  private _setValidationRules(): void {
    ValidationRules
      .ensure((businessObject: IModdleElement) => businessObject.id)
      .displayName('elementId')
      .required()
        .withMessage('Id cannot be blank.')
      .then()
      .satisfies((id: string) => this._formIdIsUnique(id) && this._isProcessIdUnique(id))
        .withMessage('Id already exists.')
      .on(this.businessObjInPanel);
  }
}
