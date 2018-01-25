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
export class SignalEventSection implements ISection {

  public path: string = '/sections/signal-event/signal-event';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IModdleElement;
  private eventBus: IEventBus;
  private moddle: IBpmnModdle;
  private modeler: IBpmnModeler;
  private generalService: GeneralService;

  public errors: Array<IModdleElement>;
  public selectedId: string;
  public selectedError: IModdleElement;

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
      if (this.businessObjInPanel.eventDefinitions && this.businessObjInPanel.eventDefinitions[0].signalRef) {
        this.selectedId = this.businessObjInPanel.eventDefinitions[0].signalRef.id;
        this.updateError();
      }
      this.checkElement();
    });
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

  private checkElement(): void {
    if (this.businessObjInPanel.eventDefinitions &&
        this.businessObjInPanel.eventDefinitions[0].$type === 'bpmn:ErrorEventDefinition') {
      this.canHandleElement = true;
    } else {
      this.canHandleElement = false;
    }
  }

  private updateError(): void {
    this.selectedError = this.errors.find((error: IModdleElement) => {
      return error.id === this.selectedId;
    });

    this.businessObjInPanel.eventDefinitions[0].errorRef = this.selectedError;
  }

  private updateName(): void {
    this.moddle.fromXML(this.getXML(), (err: Error, definitions: IDefinition) => {

      const rootElements: Array<IModdleElement> = definitions.get('rootElements');
      const error: IModdleElement = rootElements.find((element: any) => {
        return element.$type === 'bpmn:Error' && element.id === this.selectedId;
      });

      error.name = this.selectedError.name;

      this.moddle.toXML(definitions, (toXMLError: Error, xmlStrUpdated: string) => {
        this.modeler.importXML(xmlStrUpdated, async(errr: Error) => {
          await this.refreshSignals();
          await this.setBusinessObj();
        });
      });
    });
  }

  private async addError(): Promise<void> {
    this.moddle.fromXML(this.getXML(), (err: Error, definitions: IDefinition) => {

      const bpmnError: IModdleElement = this.moddle.create('bpmn:Error',
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

}
