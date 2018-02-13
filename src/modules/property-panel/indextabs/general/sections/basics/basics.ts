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
  private someId: string;

  public validationController: ValidationController;
  public businessObjInPanel: IModdleElement;
  public elementDocumentation: string;
  public validationError: boolean = false;

  constructor(controller?: ValidationController) {
    this.validationController = controller;
  }

  public activate(model: IPageModel): void {
    this.eventBus = model.modeler.get('eventBus');
    this.modeling = model.modeler.get('modeling');
    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;

    this.validationController.subscribe((event: ValidateEvent) => {
      this.validateForm(event);
    });

    const selectedEvents: Array<IShape> = this.modeler.get('selection')._selectedElements;
    if (selectedEvents[0]) {
      this.businessObjInPanel = selectedEvents[0].businessObject;
      this.elementInPanel = selectedEvents[0];
      this.init();
    }

    this.eventBus.on(['element.click', 'shape.changed', 'selection.changed'], (event: IEvent) => {
      if (this.validationError) {
        this.businessObjInPanel.id = this.elementInPanel.id;
        this.validationController.validate();
      }
      if (event.newSelection && event.newSelection.length !== 0) {
        this.elementInPanel = event.newSelection[0];
        this.businessObjInPanel = event.newSelection[0].businessObject;
      } else if (event.element) {
        this.elementInPanel = event.element;
        this.businessObjInPanel = event.element.businessObject;
      }
      this.init();

      ValidationRules.ensure((businessObject: IModdleElement) => businessObject.id).required()
      .withMessage(`Id cannot be blank.`)
      .on(this.businessObjInPanel);
    });
    this.setFirstElement();

  }

  private init(): void {
    if (this.businessObjInPanel.documentation && this.businessObjInPanel.documentation.length > 0) {
      this.elementDocumentation = this.businessObjInPanel.documentation[0].text;
    } else {
      this.elementDocumentation = '';
    }
  }

  private setFirstElement(): void {
   /* const selectedEvents: Array<IShape> = this.modeler.get('selection')._selectedElements;
    if (selectedEvents[0]) {
      return;
    } else {
      const rootElements: any = this.modeler._definitions.rootElements;
      const process: IModdleElement = rootElements.find((element: any ) =>  {
        return element.$type === 'bpmn:Process';
      });

      let startEvent: IModdleElement;

      if (process.flowElements) {
        startEvent = process.flowElements.find((element: any ) => {
          return element.$type === 'bpmn:StartEvent';
        });
      }

      if (!startEvent) {
        startEvent = process;
      }

      const elementRegistry: IElementRegistry = this.modeler.get('elementRegistry');
      const elementInPanel: IShape = elementRegistry.get(startEvent.id);

      this.modeler.get('selection').select(elementInPanel);
    }*/
  }

  private getXML(): string {
    let xml: string;
    this.modeler.saveXML({format: true}, (err: Error, diagrammXML: string) => {
      xml = diagrammXML;
    });
    return xml;
  }

  public checkElement(element: IModdleElement): boolean {
    return true;
  }

  private updateDocumentation(): void {
    this.businessObjInPanel.documentation = [];

    const documentation: IModdleElement = this.moddle.create('bpmn:Documentation',
    { text: this.elementDocumentation });
    this.businessObjInPanel.documentation.push(documentation);

    this.modeling.updateProperties(this.elementInPanel, {
      documentation: this.businessObjInPanel.documentation,
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
