import {IBpmnModdle,
  IBpmnModeler,
  IDefinition,
  IElementRegistry,
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

  private businessObjInPanel: IModdleElement;
  private eventBus: IEventBus;
  private moddle: IBpmnModdle;
  private modeler: IBpmnModeler;
  private generalService: GeneralService;

  public errors: Array<IModdleElement>;
  public selectedId: string;
  public selectedError: IModdleElement;
  public isEndEvent: boolean = false;

  constructor(generalService?: GeneralService) {
    this.generalService = generalService;
  }

  public async activate(model: IPageModel): Promise<void> {
    this.eventBus = model.modeler.get('eventBus');
    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;
    this.errors = await this.getErrors();

    this.eventBus.on('element.click', (event: IEvent) => {
      this.businessObjInPanel = event.element.businessObject;
      if (this.businessObjInPanel.eventDefinitions && this.businessObjInPanel.eventDefinitions[0].errorRef) {
        this.selectedId = this.businessObjInPanel.eventDefinitions[0].errorRef.id;

        this.updateError();
      }
      this.canHandleElement = this.checkElement(this.businessObjInPanel);
    });
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

  private getErrors(): Promise<Array<IModdleElement>> {
    return new Promise((resolve: Function, reject: Function): void => {

      this.moddle.fromXML(this.getXML(), (err: Error, definitions: IDefinition) => {
        const rootElements: Array<IModdleElement> = definitions.get('rootElements');
        const errors: Array<IModdleElement> = rootElements.filter((element: IModdleElement) => {
          return element.$type === 'bpmn:Error';
        });

        resolve(errors);
      });
    });
  }

  private updateError(): void {
    this.selectedError = this.errors.find((error: IModdleElement) => {
      return error.id === this.selectedId;
    });

    this.businessObjInPanel.eventDefinitions[0].errorRef = this.selectedError;
    this.selectedError.errorMessageVariable = this.businessObjInPanel.eventDefinitions[0].errorMessageVariable;
  }

  private updateErrorName(): void {
    this.moddle.fromXML(this.getXML(), async(err: Error, definitions: IDefinition) => {

      const rootElements: Array<IModdleElement> = definitions.get('rootElements');
      const error: IModdleElement = rootElements.find((element: any) => {
        return element.$type === 'bpmn:Error' && element.id === this.selectedId;
      });

      error.name = this.selectedError.name;

      await this.updateXML(definitions);
    });
  }

  private updateErrorCode(): void {
    this.moddle.fromXML(this.getXML(), async(fromXMLError: Error, definitions: IDefinition) => {
      const rootElements: Array<IModdleElement> = definitions.get('rootElements');
      const error: IModdleElement = rootElements.find((element: any) => {
        return element.$type === 'bpmn:Error' && element.id === this.selectedId;
      });

      error.errorCode = this.selectedError.errorCode;

      await this.updateXML(definitions);
    });
  }

  private updateErrorMessage(): void {
    this.businessObjInPanel.eventDefinitions[0].errorMessageVariable = this.selectedError.errorMessageVariable;
  }

  private async addError(): Promise<void> {
    this.moddle.fromXML(this.getXML(), async(err: Error, definitions: IDefinition) => {

      const bpmnError: IModdleElement = this.moddle.create('bpmn:Error',
        { id: `Error_${this.generalService.generateRandomId()}`, name: 'Error Name' });

      definitions.get('rootElements').push(bpmnError);

      await this.updateXML(definitions);

      this.selectedId = bpmnError.id;
      this.updateError();
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
