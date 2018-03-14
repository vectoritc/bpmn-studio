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

  private businessObjInPanel: IEscalationElement;
  private moddle: IBpmnModdle;
  private modeler: IBpmnModeler;
  private generalService: GeneralService;

  private escalationCodeVariable: string;
  private isBoundaryEvent: boolean = true;

  public escalations: Array<IEscalation>;
  public selectedId: string;
  public selectedEscalation: IEscalation;

  constructor(generalService?: GeneralService) {
    this.generalService = generalService;
  }

  public async activate(model: IPageModel): Promise<void> {
    this.businessObjInPanel = model.elementInPanel.businessObject;

    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;
    this.escalations = await this.getEscalations();

    this.init();
  }

  public isSuitableForElement(element: IShape): boolean {
    if (this.elementIsEscalationEvent(element)) {
      this.isBoundaryEvent = this.elementIsBoundaryEvent(element);
      return true;
    }
    return false;
  }

  private elementIsEscalationEvent(element: IShape): boolean {
    return element !== undefined
        && element.businessObject !== undefined
        && element.businessObject.eventDefinitions !== undefined
        && element.businessObject.eventDefinitions[0].$type === 'bpmn:EscalationEventDefinition';
  }

  private elementIsBoundaryEvent(element: IShape): boolean {
    return element !== undefined
        && element.businessObject !== undefined
        && element.businessObject.$type === 'bpmn:BoundaryEvent';
  }

  private init(): void {
    const eventDefinitions: Array<IModdleElement> = this.businessObjInPanel.eventDefinitions;
    const businessObjectHasNoEscalationEvents: boolean = eventDefinitions === undefined
                                                      || eventDefinitions === null
                                                      || eventDefinitions[0].$type !== 'bpmn:EscalationEventDefinition';

    if (businessObjectHasNoEscalationEvents) {
      return;
    }

    const escalationElement: IEscalationElement = this.businessObjInPanel.eventDefinitions[0];
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

  private getEscalations(): Array<IEscalation> {
    const rootElements: Array<IModdleElement> = this.modeler._definitions.rootElements;
    const escalations: Array<IEscalation> = rootElements.filter((element: IModdleElement) => {
      return element.$type === 'bpmn:Escalation';
    });

    return escalations;
  }

  public updateEscalation(): void {
    if (this.selectedId === undefined || this.selectedId === null) {
      this.selectedEscalation =  null;

      return;
    }

    this.selectedEscalation = this.escalations.find((escalation: IModdleElement) => {
      return escalation.id === this.selectedId;
    });

    const escalationElement: IEscalationElement = this.businessObjInPanel.eventDefinitions[0];

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

  private _getSelectedEscalation(): IEscalation {
    const rootElements: Array<IModdleElement> = this.modeler._definitions.rootElements;
    const selectedEscalation: IEscalation = rootElements.find((element: IModdleElement) => {
      return element.$type === 'bpmn:Escalation' && element.id === this.selectedId;
    });

    return selectedEscalation;
  }

  public updateEscalationCodeVariable(): void {
    const escalationElement: IEscalationElement = this.businessObjInPanel.eventDefinitions[0];
    escalationElement.escalationCodeVariable = this.escalationCodeVariable;
  }

  public addEscalation(): void {
    const bpmnEscalationProperty: Object = {
      id: `Escalation_${this.generalService.generateRandomId()}`,
      name: 'Escalation Name',
    };
    const bpmnEscalation: IEscalation = this.moddle.create('bpmn:Escalation', bpmnEscalationProperty);

    this.modeler._definitions.rootElements.push(bpmnEscalation);

    this.moddle.toXML(this.modeler._definitions.rootElements, (toXMLError: Error, xmlStrUpdated: string) => {
      this.modeler.importXML(xmlStrUpdated, async(importXMLError: Error) => {
        await this.refreshEscalations();
        await this.setBusinessObject();
        this.selectedId = bpmnEscalation.id;
        this.selectedEscalation = bpmnEscalation;
        this.updateEscalation();
      });
    });
  }

  private async refreshEscalations(): Promise<void> {
    this.escalations = await this.getEscalations();
  }

  private setBusinessObject(): void {
    const elementRegistry: IElementRegistry = this.modeler.get('elementRegistry');
    const elementInPanel: IShape = elementRegistry.get(this.businessObjInPanel.id);
    this.businessObjInPanel = elementInPanel.businessObject;
  }

  public clearName(): void {
    this.selectedEscalation.name = '';
  }

  public clearCode(): void {
    this.selectedEscalation.escalationCode = '';
  }

  public clearVariable(): void {
    this.escalationCodeVariable = '';
  }
}
