import {IBpmnModdle,
  IBpmnModeler,
  IDefinition,
  IElementRegistry,
  IError,
  IErrorElement,
  IEvent,
  IEventBus,
  IModdleElement,
  IPageModel,
  ISection,
  IShape} from '../../../../../../contracts';

import {inject} from 'aurelia-framework';
import {GeneralService} from '../../service/general.service';

@inject(GeneralService)
export class ErrorEventSection implements ISection {

  public path: string = '/sections/error-event/error-event';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IErrorElement;
  private eventBus: IEventBus;
  private moddle: IBpmnModdle;
  private modeler: IBpmnModeler;
  private generalService: GeneralService;

  public errors: Array<IError>;
  public selectedId: string;
  public selectedError: IError;
  public isEndEvent: boolean = false;

  private errorMessageVariable: string;

  constructor(generalService?: GeneralService) {
    this.generalService = generalService;
  }

  public async activate(model: IPageModel): Promise<void> {
    this.eventBus = model.modeler.get('eventBus');
    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;
    this.errors = await this.getErrors();

    const selectedEvents: Array<IShape> = this.modeler.get('selection')._selectedElements;
    if (selectedEvents[0]) {
      this.businessObjInPanel = selectedEvents[0].businessObject;
      this.init();
    }

    this.eventBus.on(['element.click', 'shape.changed', 'selection.changed'], (event: IEvent) => {
      if (event.newSelection && event.newSelection.length !== 0) {
        this.businessObjInPanel = event.newSelection[0].businessObject;
      } else if (event.element) {
        this.businessObjInPanel = event.element.businessObject;
      }
      this.init();
    });
  }

  private init(): void {
    if (this.businessObjInPanel.eventDefinitions
      && this.businessObjInPanel.eventDefinitions[0].$type === 'bpmn:ErrorEventDefinition') {
        const errorElement: IErrorElement = this.businessObjInPanel.eventDefinitions[0];

        if (errorElement.errorRef) {
          this.selectedId = errorElement.errorRef.id;
          this.updateError();
        } else {
          this.selectedError = null;
          this.selectedId = null;
        }
    }
    this.canHandleElement = this.checkElement(this.businessObjInPanel);
  }

  public checkElement(element: IModdleElement): boolean {
    if (element.eventDefinitions &&
        element.eventDefinitions[0].$type === 'bpmn:ErrorEventDefinition') {
          if (element.$type === 'bpmn:EndEvent') {
            this.isEndEvent = true;
          } else if (element.$type === 'bpmn:BoundaryEvent') {
            this.isEndEvent = false;
          }
          return true;
    } else {
      return false;
    }
  }

  private getXML(): string {
    let xml: string;
    this.modeler.saveXML({format: true}, (err: Error, diagrammXML: string) => {
      xml = diagrammXML;
    });
    return xml;
  }

  private getErrors(): Promise<Array<IError>> {
    return new Promise((resolve: Function, reject: Function): void => {

      this.moddle.fromXML(this.getXML(), (err: Error, definitions: IDefinition) => {
        const rootElements: Array<IModdleElement> = definitions.get('rootElements');
        const errors: Array<IErrorElement> = rootElements.filter((element: IModdleElement) => {
          return element.$type === 'bpmn:Error';
        });

        resolve(errors);
      });
    });
  }

  private updateError(): void {
    if (this.selectedId) {
      this.selectedError = this.errors.find((error: IError) => {
        return error.id === this.selectedId;
      });

      const errorElement: IErrorElement = this.businessObjInPanel.eventDefinitions[0];

      this.errorMessageVariable = errorElement.errorMessageVariable;
      if (!this.isEndEvent) {
        this.errorMessageVariable = this.errorMessageVariable;
      }
    } else {
      this.selectedError = null;
    }
  }

  private updateErrorName(): void {
    this.moddle.fromXML(this.getXML(), async(err: Error, definitions: IDefinition) => {

      const rootElements: Array<IModdleElement> = definitions.get('rootElements');
      const error: IError = rootElements.find((element: IModdleElement) => {
        return element.$type === 'bpmn:Error' && element.id === this.selectedId;
      });

      error.name = this.selectedError.name;

      await this.updateXML(definitions);
    });
  }

  private updateErrorCode(): void {
    this.moddle.fromXML(this.getXML(), async(fromXMLError: Error, definitions: IDefinition) => {
      const rootElements: Array<IModdleElement> = definitions.get('rootElements');
      const error: IError = rootElements.find((element: any) => {
        return element.$type === 'bpmn:Error' && element.id === this.selectedId;
      });

      error.errorCode = this.selectedError.errorCode;

      await this.updateXML(definitions);
    });
  }

  private updateErrorMessage(): void {
    const errorElement: IErrorElement = this.businessObjInPanel.eventDefinitions[0];
    errorElement.errorMessageVariable = this.errorMessageVariable;
  }

  private async addError(): Promise<void> {
    this.moddle.fromXML(this.getXML(), async(err: Error, definitions: IDefinition) => {

      const bpmnError: IError = this.moddle.create('bpmn:Error',
        { id: `Error_${this.generalService.generateRandomId()}`, name: 'Error Name' });

      definitions.get('rootElements').push(bpmnError);

      this.moddle.toXML(definitions, (error: Error, xmlStrUpdated: string) => {
        this.modeler.importXML(xmlStrUpdated, async(errr: Error) => {
          await this.refreshErrors();
          await this.setBusinessObj();
          this.selectedId = bpmnError.id;
          this.selectedError = bpmnError;
          this.updateError();
        });
      });
    });
  }

  private async refreshErrors(): Promise<void> {
    this.errors = await this.getErrors();
  }

  private setBusinessObj(): Promise<void> {
    return new Promise((resolve: Function, reject: Function): void => {
      const elementRegistry: IElementRegistry = this.modeler.get('elementRegistry');
      const elementInPanel: IShape = elementRegistry.get(this.businessObjInPanel.id);
      this.businessObjInPanel = elementInPanel.businessObject;

      resolve();
    });
  }

  private updateXML(definitions: IDefinition): Promise<void> {
    return new Promise((resolve: Function, reject: Function): void => {

      this.moddle.toXML(definitions, (toXMLError: Error, xmlStrUpdated: string) => {
        this.modeler.importXML(xmlStrUpdated, async(errr: Error) => {
          await this.refreshErrors();
          await this.setBusinessObj();
        });
      });

      resolve();
    });
  }

}
