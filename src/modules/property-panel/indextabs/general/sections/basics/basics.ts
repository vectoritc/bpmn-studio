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

import {inject} from 'aurelia-framework';
import {ValidateEvent, ValidateResult, ValidationController, ValidationRules} from 'aurelia-validation';

@inject(ValidationController)
export class BasicsSection implements ISection {

  public path: string = '/sections/basics/basics';
  public canHandleElement: boolean = true;
  private eventBus: IEventBus;
  private modeling: IModeling;
  private modeler: IBpmnModeler;
  private moddle: IBpmnModdle;
  private elementInPanel: IShape;

  public validationController: ValidationController;
  public businessObjInPanel: IModdleElement;
  public elementDocumentation: string;
  public validationError: boolean = false;

  constructor(controller?: ValidationController) {
    this.validationController = controller;
  }

  public activate(model: IPageModel): void {
    this.elementInPanel = model.elementInPanel;
    this.businessObjInPanel = model.elementInPanel.businessObject;
    this.modeling = model.modeler.get('modeling');
    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;

    this.validationController.subscribe((event: ValidateEvent) => {
      this.validateForm(event);
    });

    this.init();

    ValidationRules.ensure((businessObject: IModdleElement) => businessObject.id).required()
      .withMessage(`Id cannot be blank.`)
      .on(this.businessObjInPanel || {});
  }

  public checkElement(element: IShape): boolean {
    if (!element) {
      return false;
    }
    return true;
  }

  private init(): void {
    if (!this.businessObjInPanel) {
      return;
    }
    if (this.businessObjInPanel.documentation && this.businessObjInPanel.documentation.length > 0) {
      this.elementDocumentation = this.businessObjInPanel.documentation[0].text;
    } else {
      this.elementDocumentation = '';
    }
  }

  private getXML(): string {
    let xml: string;
    this.modeler.saveXML({format: true}, (err: Error, diagrammXML: string) => {
      xml = diagrammXML;
    });
    return xml;
  }

  private updateDocumentation(): void {
    this.elementInPanel.documentation = [];

    const documentation: IModdleElement = this.moddle.create('bpmn:Documentation',
    { text: this.elementDocumentation });
    this.elementInPanel.documentation.push(documentation);

    this.modeling.updateProperties(this.elementInPanel, {
      documentation: this.elementInPanel.documentation,
    });
  }

  private clearId(): void {
    this.businessObjInPanel.id = '';
    this.validationController.validate();
    this.updateId();
  }

  private clearName(): void {
    this.businessObjInPanel.name = '';
    this.updateName();
  }

  private clearDocumentation(): void {
    this.elementDocumentation = '';
    this.updateDocumentation();
  }

  private updateName(): void {
    this.modeling.updateProperties(this.elementInPanel, {
      name: this.businessObjInPanel.name,
    });
  }

  private updateId(): void {
    if (this.validationController.errors.length > 0) {
      return;
    }
    this.modeling.updateProperties(this.elementInPanel, {
      id: this.businessObjInPanel.id,
    });
  }

  private validateForm(event: ValidateEvent): void {
    if (event.type === 'validate') {
      event.results.forEach((result: ValidateResult) => {
        if (result.valid === false) {
          this.validationError = true;
          document.getElementById(result.propertyName).style.border = '2px solid red';
        } else {
          this.validationError = false;
          document.getElementById(result.propertyName).style.border = '';
        }
      });
    }
  }
}
