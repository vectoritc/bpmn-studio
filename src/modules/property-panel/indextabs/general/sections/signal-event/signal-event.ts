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
  private eventBus: IEventBus;
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
    this.eventBus = model.modeler.get('eventBus');
    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;

    this.signals = await this.getSignals();

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
    this.canHandleElement = this.checkElement(this.businessObjInPanel);
  }

  public checkElement(element: IModdleElement): boolean {
    if (element.eventDefinitions &&
        element.eventDefinitions[0].$type === 'bpmn:SignalEventDefinition') {
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
