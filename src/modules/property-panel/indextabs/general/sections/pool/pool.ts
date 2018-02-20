import {inject} from 'aurelia-framework';
import {ValidateEvent, ValidateResult, ValidationController, ValidationRules} from 'aurelia-validation';
import {IBpmnModeler,
  IEvent,
  IEventBus,
  IModdleElement,
  IPageModel,
  IPoolElement,
  ISection,
  IShape} from '../../../../../../contracts';

@inject(ValidationController)
export class PoolSection implements ISection {

  public path: string = '/sections/pool/pool';
  public canHandleElement: boolean = false;
  public validationController: ValidationController;
  public validationError: boolean = false;

  private businessObjInPanel: IPoolElement;
  private modeler: IBpmnModeler;
  private saveProcessId: string;

  constructor(controller?: ValidationController) {
    this.validationController = controller;
  }

  public activate(model: IPageModel): void {
    if (this.validationError) {
      this.businessObjInPanel.processRef.id = this.saveProcessId;
      this.validationController.validate();
    }

    this.businessObjInPanel = model.elementInPanel.businessObject;
    this.saveProcessId = this.businessObjInPanel.processRef.id;
    this.modeler = model.modeler;

    this.validationController.subscribe((event: ValidateEvent) => {
      this.validateForm(event);
    });

    ValidationRules.ensure((businessObject: IModdleElement) => businessObject.id)
      .displayName('processId')
      .required()
      .withMessage(`Process-Id cannot be blank.`)
      .on(this.businessObjInPanel.processRef || {});
  }

  public detached(): void {
    if (this.validationError) {
      this.businessObjInPanel.processRef.id = this.saveProcessId;
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
  }

  private clearName(): void {
    this.businessObjInPanel.processRef.name = '';
  }

  private validateForm(event: ValidateEvent): void {
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

}
