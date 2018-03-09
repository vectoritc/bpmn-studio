import {
  IBpmnModdle,
  IBpmnModeler,
  IDefinition,
  IElementRegistry,
  IModdleElement,
  IPageModel,
  ISection,
  IShape,
  ISignal,
  ISignalElement,
} from '../../../../../../contracts';

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

  public isSuitableForElement(element: IShape): boolean {
    return this.elementIsSignalEvent(element);
  }

  private elementIsSignalEvent(element: IShape): boolean {
    return element !== undefined
        && element.businessObject !== undefined
        && element.businessObject.eventDefinitions !== undefined
        && element.businessObject.eventDefinitions[0].$type === 'bpmn:SignalEventDefinition';
  }

  private init(): void {
    const eventDefinitions: Array<IModdleElement> = this.businessObjInPanel.eventDefinitions;
    const businessObjectHasNoSignalEvents: boolean = eventDefinitions === undefined
                                                  || eventDefinitions === null
                                                  || eventDefinitions[0].$type !== 'bpmn:SignalEventDefinition';
    if (businessObjectHasNoSignalEvents) {
      return;
    }

    const signalElement: ISignalElement = this.businessObjInPanel.eventDefinitions[0];
    const elementReferencesSignal: boolean = signalElement.signalRef !== undefined
                                          && signalElement.signalRef !== null;

    if (elementReferencesSignal) {
      this.selectedId = signalElement.signalRef.id;
      this.updateSignal();
    } else {
      this.selectedSignal = null;
      this.selectedId = null;
    }
  }

  private getSignals(): Array<ISignal> {
    const rootElements: Array<IModdleElement> = this.modeler._definitions.rootElements;
    const signals: Array<ISignal> = rootElements.filter((element: IModdleElement) => {
      return element.$type === 'bpmn:Signal';
    });

    return signals;
  }

  private updateSignal(): void {
    this.selectedSignal = this.signals.find((signal: ISignal) => {
      return signal.id === this.selectedId;
    });

    const signalElement: ISignalElement = this.businessObjInPanel.eventDefinitions[0];
    signalElement.signalRef = this.selectedSignal;
  }

  private updateName(): void {
    const rootElements: Array<IModdleElement> = this.modeler._definitions.rootElements;
    const signal: ISignal = rootElements.find((element: IModdleElement) => {
      const elementIsSelectedSignal: boolean = element.$type === 'bpmn:Signal' && element.id === this.selectedId;
      return elementIsSelectedSignal;
    });

    signal.name = this.selectedSignal.name;
  }

  private addSignal(): void {
    const bpmnSignalProperty: Object = {id: `Signal_${this.generalService.generateRandomId()}`, name: 'Signal Name'};
    const bpmnSignal: ISignalElement = this.moddle.create('bpmn:Signal', bpmnSignalProperty);

    this.modeler._definitions.rootElements.push(bpmnSignal);

    this.moddle.toXML(this.modeler._definitions.rootElements, (toXMLError: Error, xmlStrUpdated: string) => {
      this.modeler.importXML(xmlStrUpdated, async(importXMLError: Error) => {
        await this.refreshSignals();
        await this.setBusinessObj();
        this.selectedId = bpmnSignal.id;
        this.selectedSignal = bpmnSignal;
        this.updateSignal();
      });
    });
  }

  private async refreshSignals(): Promise<void> {
    this.signals = await this.getSignals();
  }

  private setBusinessObj(): void {
      const elementRegistry: IElementRegistry = this.modeler.get('elementRegistry');
      const elementInPanel: IShape = elementRegistry.get(this.businessObjInPanel.id);
      this.businessObjInPanel = elementInPanel.businessObject;
  }

  private clearName(): void {
    this.selectedSignal.name = '';
  }
}
