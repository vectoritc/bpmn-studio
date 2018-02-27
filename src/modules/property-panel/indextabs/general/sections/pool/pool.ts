import {inject} from 'aurelia-framework';
import {ValidateEvent, ValidationController, ValidationRules} from 'aurelia-validation';
import { Config } from 'protractor';
import {
  IBpmnModdle,
  IBpmnModeler,
  IElementRegistry,
  IModdleElement,
  IPageModel,
  IPoolElement,
  ISection,
  IShape,
} from '../../../../../../contracts';

@inject(ValidationController)
export class PoolSection implements ISection {

  public path: string = '/sections/pool/pool';
  public canHandleElement: boolean = false;
  public validationController: ValidationController;
  public validationError: boolean = false;

  private businessObjInPanel: IPoolElement;
  private modeler: IBpmnModeler;
  private moddle: IBpmnModdle;
  private previousId: string;

  constructor(controller?: ValidationController) {
    this.validationController = controller;
  }

  public activate(model: IPageModel): void {
    if (this.validationError) {
      this.businessObjInPanel.processRef.id = this.previousId;
      this.validationController.validate();
    }

    this.businessObjInPanel = model.elementInPanel.businessObject;
    this.previousId = this.businessObjInPanel.processRef.id;
    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;

    this.validationController.subscribe((event: ValidateEvent) => {
      this.validateId(event);
    });

    this.setValidationRules();
  }

  public detached(): void {
    if (this.validationError) {
      this.businessObjInPanel.processRef.id = this.previousId;
      this.validationController.validate();
    }
  }

  public isSuitableForElement(element: IShape): boolean {
    return this.elementIsParticipant(element);
  }

  private elementIsParticipant(element: IShape): boolean {
    return element !== undefined
        && element.businessObject !== undefined
        && element.businessObject.$type === 'bpmn:Participant';
  }

  private clearVersion(): void {
    this.businessObjInPanel.processRef.versionTag = '';
  }

  private clearId(): void {
    this.businessObjInPanel.processRef.id = '';
    this.validationController.validate();
  }

  private clearName(): void {
    this.businessObjInPanel.processRef.name = '';
  }

  private validateId(event: ValidateEvent): void {
    if (event.type !== 'validate') {
      return;
    }
    this.validationError = false;

    for (const result of event.results) {
      if (result.rule.property.displayName !== 'processId') {
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

  private isIdUnique(id: string): boolean {
    const elementRegistry: IElementRegistry = this.modeler.get('elementRegistry');
    const elementsWithSameId: Array<IShape> =  elementRegistry.filter((element: IShape) => {
      if (element.businessObject !== this.businessObjInPanel) {
        if (element.type !== 'label') {
          return element.businessObject.id === this.businessObjInPanel.processRef.id;
        }
      }
      return false;
    });

    return elementsWithSameId.length === 0;
  }

  private setValidationRules(): void {
    ValidationRules.ensure((businessObject: IModdleElement) => businessObject.id)
    .displayName('processId')
    .required()
      .withMessage(`Process-Id cannot be blank.`)
    .then()
    .satisfies((id: string) => this.isIdUnique(id))
      .withMessage(`Process-Id already exists.`)
    .on(this.businessObjInPanel.processRef);
  }
}
