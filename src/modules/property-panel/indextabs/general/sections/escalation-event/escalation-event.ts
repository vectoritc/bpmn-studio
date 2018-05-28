import {
  IBpmnModdle,
  IBpmnModeler,
  IDefinition,
  IElementRegistry,
  IEscalation,
  IEscalationElement,
  IModdleElement,
  IPageModel,
  ISection,
  IShape,
} from '../../../../../../contracts';

import {inject} from 'aurelia-framework';
import {GeneralService} from '../../service/general.service';

@inject(GeneralService)
export class EscalationEventSection implements ISection {

  public path: string = '/sections/escalation-event/escalation-event';
  public canHandleElement: boolean = false;
  public escalations: Array<IEscalation>;
  public selectedId: string;
  public selectedEscalation: IEscalation;
  private escalationCodeVariable: string;

  private _businessObjInPanel: IEscalationElement;
  private _moddle: IBpmnModdle;
  private _modeler: IBpmnModeler;
  private _generalService: GeneralService;
  private _isBoundaryEvent: boolean = true;

  constructor(generalService?: GeneralService) {
    this._generalService = generalService;
  }

  public async activate(model: IPageModel): Promise<void> {
    this._businessObjInPanel = model.elementInPanel.businessObject;

    this._moddle = model.modeler.get('moddle');
    this._modeler = model.modeler;
    this.escalations = await this._getEscalations();

    this._init();
  }

  public isSuitableForElement(element: IShape): boolean {
    if (this._elementIsEscalationEvent(element)) {
      this._isBoundaryEvent = this._elementIsBoundaryEvent(element);
      return true;
    }
    return false;
  }

  public updateEscalation(): void {
    if (this.selectedId === undefined || this.selectedId === null) {
      this.selectedEscalation =  null;

      return;
    }

    this.selectedEscalation = this.escalations.find((escalation: IModdleElement) => {
      return escalation.id === this.selectedId;
    });

    const escalationElement: IEscalationElement = this._businessObjInPanel.eventDefinitions[0];

    this.escalationCodeVariable = escalationElement.escalationCodeVariable;
    escalationElement.escalationRef = this.selectedEscalation;
  }

  public updateEscalationName(): void {
    const selectedEscalation: IEscalation = this._getSelectedEscalation();
    selectedEscalation.name = this.selectedEscalation.name;
  }

  public updateEscalationCode(): void {
    const selectedEscalation: IEscalation = this._getSelectedEscalation();
    selectedEscalation.escalationCode = this.selectedEscalation.escalationCode;
  }

  public updateEscalationCodeVariable(): void {
    const escalationElement: IEscalationElement = this._businessObjInPanel.eventDefinitions[0];
    escalationElement.escalationCodeVariable = this.escalationCodeVariable;
  }

  public addEscalation(): void {
    const bpmnEscalationProperty: Object = {
      id: `Escalation_${this._generalService.generateRandomId()}`,
      name: 'Escalation Name',
    };
    const bpmnEscalation: IEscalation = this._moddle.create('bpmn:Escalation', bpmnEscalationProperty);

    this._modeler._definitions.rootElements.push(bpmnEscalation);

    this._moddle.toXML(this._modeler._definitions.rootElements, (toXMLError: Error, xmlStrUpdated: string) => {
      this._modeler.importXML(xmlStrUpdated, async(importXMLError: Error) => {
        await this._refreshEscalations();
        await this._setBusinessObject();
        this.selectedId = bpmnEscalation.id;
        this.selectedEscalation = bpmnEscalation;
        this.updateEscalation();
      });
    });
  }

  private async _refreshEscalations(): Promise<void> {
    this.escalations = await this._getEscalations();
  }

  private _setBusinessObject(): void {
    const elementRegistry: IElementRegistry = this._modeler.get('elementRegistry');
    const elementInPanel: IShape = elementRegistry.get(this._businessObjInPanel.id);
    this._businessObjInPanel = elementInPanel.businessObject;
  }

  private _elementIsEscalationEvent(element: IShape): boolean {
    return element !== undefined
        && element.businessObject !== undefined
        && element.businessObject.eventDefinitions !== undefined
        && element.businessObject.eventDefinitions[0].$type === 'bpmn:EscalationEventDefinition';
  }

  private _elementIsBoundaryEvent(element: IShape): boolean {
    return element !== undefined
        && element.businessObject !== undefined
        && element.businessObject.$type === 'bpmn:BoundaryEvent';
  }

  private _init(): void {
    const eventDefinitions: Array<IModdleElement> = this._businessObjInPanel.eventDefinitions;
    const businessObjectHasNoEscalationEvents: boolean = eventDefinitions === undefined
                                                      || eventDefinitions === null
                                                      || eventDefinitions[0].$type !== 'bpmn:EscalationEventDefinition';

    if (businessObjectHasNoEscalationEvents) {
      return;
    }

    const escalationElement: IEscalationElement = this._businessObjInPanel.eventDefinitions[0];
    const elementReferencesEscalation: boolean = escalationElement.escalationRef !== undefined
                                              && escalationElement.escalationRef !== null;

    if (elementReferencesEscalation) {
      this.selectedId = escalationElement.escalationRef.id;
      this.updateEscalation();
    } else {
      this.selectedEscalation = null;
      this.selectedId = null;
    }
  }

  private _getEscalations(): Array<IEscalation> {
    const rootElements: Array<IModdleElement> = this._modeler._definitions.rootElements;
    const escalations: Array<IEscalation> = rootElements.filter((element: IModdleElement) => {
      return element.$type === 'bpmn:Escalation';
    });

    return escalations;
  }

  private _getSelectedEscalation(): IEscalation {
    const rootElements: Array<IModdleElement> = this._modeler._definitions.rootElements;
    const selectedEscalation: IEscalation = rootElements.find((element: IModdleElement) => {
      const isSelectedEscalation: boolean = element.$type === 'bpmn:Escalation' && element.id === this.selectedId;

      return isSelectedEscalation;
    });

    return selectedEscalation;
  }
}
