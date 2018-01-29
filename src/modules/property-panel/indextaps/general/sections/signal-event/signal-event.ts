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

  public signals: Array<IModdleElement>;
  public selectedId: string;
  public selectedSignal: IModdleElement;

  constructor(generalService?: GeneralService) {
    this.generalService = generalService;
  }

  public async activate(model: IPageModel): Promise<void> {
    this.eventBus = model.modeler.get('eventBus');
    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;

    this.signals = await this.getSignals();

    const selectedEvents: any = this.modeler.get('selection')._selectedElements;
    if (selectedEvents[0]) {
      this.businessObjInPanel = selectedEvents[0].businessObject;
      this.init();
    }

    this.eventBus.on('element.click', (event: IEvent) => {
      this.businessObjInPanel = event.element.businessObject;
      this.init();
    });
  }

  private init(): void {
    if (this.businessObjInPanel.eventDefinitions
      && this.businessObjInPanel.eventDefinitions[0].$type === 'bpmn:SignalEventDefinition') {
        if (this.businessObjInPanel.eventDefinitions[0].signalRef) {
          this.selectedId = this.businessObjInPanel.eventDefinitions[0].signalRef.id;
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

  private getSignals(): Promise<Array<IModdleElement>> {
    return new Promise((resolve: Function, reject: Function): void => {

      this.moddle.fromXML(this.getXML(), (err: Error, definitions: IDefinition) => {
        const rootElements: Array<IModdleElement> = definitions.get('rootElements');
        const signals: Array<IModdleElement> = rootElements.filter((element: IModdleElement) => {
          return element.$type === 'bpmn:Signal';
        });

        resolve(signals);
      });
    });
  }

  private updateSignal(): void {
    this.selectedSignal = this.signals.find((signal: IModdleElement) => {
      return signal.id === this.selectedId;
    });

    this.businessObjInPanel.eventDefinitions[0].signalRef = this.selectedSignal;
  }

  private updateName(): void {
    this.moddle.fromXML(this.getXML(), (err: Error, definitions: IDefinition) => {

      const rootElements: Array<IModdleElement> = definitions.get('rootElements');
      const signal: IModdleElement = rootElements.find((element: any) => {
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

      const bpmnSignal: IModdleElement = this.moddle.create('bpmn:Signal',
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

}
