import {IBpmnModdle,
  IBpmnModeler,
  IDefinition,
  IElementRegistry,
  IEvent,
  IEventBus,
  IModdleElement,
  IPageModel,
  ISection,
  IShape,
  ISignal,
  ISignalElement} from '../../../../../../contracts';

import {inject} from 'aurelia-framework';
import {GeneralService} from '../../service/general.service';

@inject(GeneralService)
export class SignalEventSection implements ISection {

  public path: string = '/sections/signal-event/signal-event';
  public canHandleElement: boolean = false;

  private businessObjInPanel: ISignalElement;
  private moddle: IBpmnModdle;
  private modeler: IBpmnModeler;
  private generalService: GeneralService;

  public signals: Array<ISignal>;
  public selectedId: string;
  public selectedSignal: ISignal;

  constructor(generalService?: GeneralService) {
    this.generalService = generalService;
  }

  public async activate(model: IPageModel): Promise<void> {
    this.businessObjInPanel = model.elementInPanel.businessObject;
    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;

    this.signals = await this.getSignals();

    this.init();
  }

  public checkElement(element: IShape): boolean {
    if (element &&
        element.businessObject &&
        element.businessObject.eventDefinitions &&
        element.businessObject.eventDefinitions[0].$type === 'bpmn:SignalEventDefinition') {
      return true;
    } else {
      return false;
    }
  }

  private init(): void {
    if (this.businessObjInPanel.eventDefinitions
      && this.businessObjInPanel.eventDefinitions[0].$type === 'bpmn:SignalEventDefinition') {
        const signalElement: ISignalElement = this.businessObjInPanel.eventDefinitions[0];

        if (signalElement.signalRef) {
          this.selectedId = signalElement.signalRef.id;
          this.updateSignal();
        } else {
          this.selectedSignal = null;
          this.selectedId = null;
        }
    }
  }

  private getXML(): string {
    let xml: string;
    this.modeler.saveXML({format: true}, (err: Error, diagrammXML: string) => {
      xml = diagrammXML;
    });
    return xml;
  }

  private getSignals(): Promise<Array<ISignal>> {
    return new Promise((resolve: Function, reject: Function): void => {

      this.moddle.fromXML(this.getXML(), (err: Error, definitions: IDefinition) => {
        const rootElements: Array<IModdleElement> = definitions.get('rootElements');
        const signals: Array<ISignal> = rootElements.filter((element: IModdleElement) => {
          return element.$type === 'bpmn:Signal';
        });

        resolve(signals);
      });
    });
  }

  private updateSignal(): void {
    this.selectedSignal = this.signals.find((signal: ISignal) => {
      return signal.id === this.selectedId;
    });

    const signalElement: ISignalElement = this.businessObjInPanel.eventDefinitions[0];

    signalElement.signalRef = this.selectedSignal;
  }

  private updateName(): void {
    this.moddle.fromXML(this.getXML(), (err: Error, definitions: IDefinition) => {

      const rootElements: Array<IModdleElement> = definitions.get('rootElements');
      const signal: ISignal = rootElements.find((element: any) => {
        return element.$type === 'bpmn:Signal' && element.id === this.selectedId;
      });

      signal.name = this.selectedSignal.name;

      this.moddle.toXML(definitions, (error: Error, xmlStrUpdated: string) => {
        this.modeler.importXML(xmlStrUpdated, async(errr: Error) => {
          await this.refreshSignals();
          await this.setBusinessObj();
        });
      });
    });
  }

  private async addSignal(): Promise<void> {
    this.moddle.fromXML(this.getXML(), (err: Error, definitions: IDefinition) => {

      const bpmnSignal: ISignalElement = this.moddle.create('bpmn:Signal',
        { id: `Signal_${this.generalService.generateRandomId()}`, name: 'Signal Name' });

      definitions.get('rootElements').push(bpmnSignal);

      this.moddle.toXML(definitions, (error: Error, xmlStrUpdated: string) => {
        this.modeler.importXML(xmlStrUpdated, async(errr: Error) => {
          await this.refreshSignals();
          await this.setBusinessObj();
          this.selectedId = bpmnSignal.id;
          this.selectedSignal = bpmnSignal;
          this.updateSignal();
        });
      });
    });
  }

  private async refreshSignals(): Promise<void> {
    this.signals = await this.getSignals();
  }

  private setBusinessObj(): Promise<void> {
    return new Promise((resolve: Function, reject: Function): void => {
      const elementRegistry: IElementRegistry = this.modeler.get('elementRegistry');
      const elementInPanel: IShape = elementRegistry.get(this.businessObjInPanel.id);
      this.businessObjInPanel = elementInPanel.businessObject;

      resolve();
    });
  }

  private clearName(): void {
    this.selectedSignal.name = '';
  }

}
