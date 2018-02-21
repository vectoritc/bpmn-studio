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
    if (this.businessObjInPanel.eventDefinitions
      && this.businessObjInPanel.eventDefinitions[0].$type === 'bpmn:EscalationEventDefinition') {
      const escalationElement: IEscalationElement = this.businessObjInPanel.eventDefinitions[0];

      if (escalationElement.escalationRef) {
        this.selectedId = escalationElement.escalationRef.id;
        this.updateEscalation();
      } else {
        this.selectedEscalation = null;
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

  private getEscalations(): Promise<Array<IEscalation>> {
    return new Promise((resolve: Function, reject: Function): void => {

      this.moddle.fromXML(this.getXML(), (err: Error, definitions: IDefinition) => {
        const rootElements: Array<IModdleElement> = definitions.get('rootElements');
        const escalations: Array<IEscalation> = rootElements.filter((element: IModdleElement) => {
          return element.$type === 'bpmn:Escalation';
        });

        resolve(escalations);
      });
    });
  }

  private updateEscalation(): void {
    if (this.selectedId) {
      this.selectedEscalation = this.escalations.find((escalation: IModdleElement) => {
        return escalation.id === this.selectedId;
      });

      const escalationElement: IEscalationElement = this.businessObjInPanel.eventDefinitions[0];

      this.escalationCodeVariable = escalationElement.escalationCodeVariable;
      escalationElement.escalationRef = this.selectedEscalation;
    } else {
      this.selectedEscalation = null;
    }
  }

  private updateEscalationName(): void {
    this.moddle.fromXML(this.getXML(), async(err: Error, definitions: IDefinition) => {

      const rootElements: Array<IModdleElement> = definitions.get('rootElements');
      const escalation: IEscalation = rootElements.find((element: any) => {
        return element.$type === 'bpmn:Escalation' && element.id === this.selectedId;
      });

      escalation.name = this.selectedEscalation.name;

      await this.updateXML(definitions);
    });
  }

  private updateEscalationCode(): void {
    this.moddle.fromXML(this.getXML(), async(fromXMLError: Error, definitions: IDefinition) => {
      const rootElements: Array<IModdleElement> = definitions.get('rootElements');
      const escalation: IEscalation = rootElements.find((element: any) => {
        return element.$type === 'bpmn:Escalation' && element.id === this.selectedId;
      });

      escalation.escalationCode = this.selectedEscalation.escalationCode;

      await this.updateXML(definitions);
    });
  }

  private updateEscalationCodeVariable(): void {
    const escalationElement: IEscalationElement = this.businessObjInPanel.eventDefinitions[0];
    escalationElement.escalationCodeVariable = this.escalationCodeVariable;
  }

  private async addEscalation(): Promise<void> {
    this.moddle.fromXML(this.getXML(), async(err: Error, definitions: IDefinition) => {

      const bpmnEscalation: IEscalation = this.moddle.create('bpmn:Escalation',
        { id: `Escalation_${this.generalService.generateRandomId()}`, name: 'Escalation Name' });

      definitions.get('rootElements').push(bpmnEscalation);

      this.moddle.toXML(definitions, (error: Error, xmlStrUpdated: string) => {
          this.modeler.importXML(xmlStrUpdated, async(errr: Error) => {
            await this.refreshEscalations();
            await this.setBusinessObj();
            this.selectedId = bpmnEscalation.id;
            this.selectedEscalation = bpmnEscalation;
            this.updateEscalation();
          });
        });
    });
  }

  private async refreshEscalations(): Promise<void> {
    this.escalations = await this.getEscalations();
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
          await this.refreshEscalations();
          await this.setBusinessObj();
        });
      });

      resolve();
    });
  }

  private clearName(): void {
    this.selectedEscalation.name = '';
  }

  private clearCode(): void {
    this.selectedEscalation.escalationCode = '';
  }

  private clearVariable(): void {
    this.escalationCodeVariable = '';
  }
}
