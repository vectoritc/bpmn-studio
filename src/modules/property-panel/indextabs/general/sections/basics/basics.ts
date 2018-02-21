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
  private saveId: string;

  public validationController: ValidationController;
  public businessObjInPanel: IModdleElement;
  public elementDocumentation: string;
  public validationError: boolean = false;

  constructor(controller?: ValidationController) {
    this.validationController = controller;
  }

  public activate(model: IPageModel): void {

    if (this.validationError) {
      this.businessObjInPanel.id = this.saveId;
      this.validationController.validate();
    }

    this.elementInPanel = model.elementInPanel;
    this.businessObjInPanel = model.elementInPanel.businessObject;
    this.saveId = model.elementInPanel.businessObject.id;
    this.modeling = model.modeler.get('modeling');
    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;

    this.validationController.subscribe((event: ValidateEvent) => {
      this.validateForm(event);
    });

    this.init();

    this.checkId();
  }

  public isSuitableForElement(element: IShape): boolean {
    if (element === undefined || element === null) {
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

  private checkId(): void {
    let firstHat: string;

    for (const first in this.moddle.ids._seed.hats) {
      firstHat = first;
      break;
    }

    const elementIds: Array<string> = this.moddle.ids._seed.hats[firstHat].flowElements.map((flowElement: IModdleElement) => {
      return flowElement.id;
    });

    const currentId: number = elementIds.indexOf(this.businessObjInPanel.id);
    elementIds.splice(currentId, 1);

    ValidationRules.ensure((businessObject: IModdleElement) => businessObject.id)
    .displayName('elementId')
    .required()
      .withMessage(`Id cannot be blank.`)
    .then()
    .satisfies((id: string) => !elementIds.includes(id))
      .withMessage(`Id already exists.`)
    .on(this.businessObjInPanel);
  }
}
