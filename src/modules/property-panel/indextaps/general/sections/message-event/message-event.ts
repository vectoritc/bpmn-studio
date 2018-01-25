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

import {bindable, inject, observable} from 'aurelia-framework';
import {GeneralService} from '../../service/general.service';

@inject(GeneralService)
export class MessageEventSection implements ISection {

  public path: string = '/sections/message-event/message-event';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IModdleElement;
  private eventBus: IEventBus;
  private moddle: IBpmnModdle;
  private modeler: IBpmnModeler;
  private msgDropdown: HTMLSelectElement;
  private generalService: GeneralService;

  public messages: Array<IModdleElement>;
  public selectedId: string;
  public selectedMessage: IModdleElement;

  constructor(generalService: GeneralService) {
    this.generalService = generalService;
  }

  public async activate(model: IPageModel): Promise<void> {
    this.eventBus = model.modeler.get('eventBus');
    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;

    this.messages = await this.getMessages();

    this.eventBus.on('element.click', (event: IEvent) => {
      this.businessObjInPanel = event.element.businessObject;

      if (this.businessObjInPanel.eventDefinitions && this.businessObjInPanel.eventDefinitions[0].messageRef) {
        this.selectedId = this.businessObjInPanel.eventDefinitions[0].messageRef.id;
        this.updateMessage();
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

  private getMessages(): Promise<Array<IModdleElement>> {
    return new Promise((resolve: Function, reject: Function): void => {

      this.moddle.fromXML(this.getXML(), (err: Error, definitions: IDefinition) => {
        const rootElements: Array<IModdleElement> = definitions.get('rootElements');
        const messages: Array<IModdleElement> = rootElements.filter((element: IModdleElement) => {
          return element.$type === 'bpmn:Message';
        });

        resolve(messages);
      });
    });
  }

  private checkElement(): void {
    if (this.businessObjInPanel.eventDefinitions &&
        this.businessObjInPanel.eventDefinitions[0].$type === 'bpmn:MessageEventDefinition') {
      this.canHandleElement = true;
    } else {
      this.canHandleElement = false;
    }
  }

  private updateMessage(): void {
    this.selectedMessage = this.messages.find((message: IModdleElement) => {
      return message.id === this.selectedId;
    });

    this.businessObjInPanel.eventDefinitions[0].messageRef = this.selectedMessage;
  }

  private updateName(): void {
    this.moddle.fromXML(this.getXML(), (err: Error, definitions: IDefinition) => {

      const rootElements: Array<IModdleElement> = definitions.get('rootElements');
      const message: IModdleElement = rootElements.find((element: any) => {
        return element.$type === 'bpmn:Message' && element.id === this.selectedId;
      });

      message.name = this.selectedMessage.name;

      this.moddle.toXML(definitions, (error: Error, xmlStrUpdated: string) => {
        this.modeler.importXML(xmlStrUpdated, async(errr: Error) => {
          await this.refreshMessages();
          await this.setBusinessObj();
        });
      });
    });
  }

  private async addMessage(): Promise<void> {
    this.moddle.fromXML(this.getXML(), (err: Error, definitions: IDefinition) => {

      const bpmnMessage: IModdleElement = this.moddle.create('bpmn:Message',
        {id: `Message_${this.generalService.generateRandomId()}`, name: 'Message Name'});

      definitions.get('rootElements').push(bpmnMessage);

      this.moddle.toXML(definitions, (error: Error, xmlStrUpdated: string) => {
        this.modeler.importXML(xmlStrUpdated, async(errr: Error) => {
          await this.refreshMessages();
          await this.setBusinessObj();
          this.selectedId = bpmnMessage.id;
          this.updateMessage();
        });
      });
    });
  }

  private async refreshMessages(): Promise<void> {
    this.messages = await this.getMessages();
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
