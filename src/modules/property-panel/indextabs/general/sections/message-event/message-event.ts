import {IBpmnModdle,
  IBpmnModeler,
  IDefinition,
  IElementRegistry,
  IEvent,
  IEventBus,
  IMessage,
  IMessageElement,
  IModdleElement,
  IPageModel,
  ISection,
  IShape} from '../../../../../../contracts';

import {inject} from 'aurelia-framework';
import {GeneralService} from '../../service/general.service';

@inject(GeneralService)
export class MessageEventSection implements ISection {

  public path: string = '/sections/message-event/message-event';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IMessageElement;
  private eventBus: IEventBus;
  private moddle: IBpmnModdle;
  private modeler: IBpmnModeler;
  private msgDropdown: HTMLSelectElement;
  private generalService: GeneralService;

  public messages: Array<IMessage>;
  public selectedId: string;
  public selectedMessage: IMessage;

  constructor(generalService?: GeneralService) {
    this.generalService = generalService;
  }

  public async activate(model: IPageModel): Promise<void> {
    this.eventBus = model.modeler.get('eventBus');
    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;

    this.messages = await this.getMessages();

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

  public checkElement(element: IShape): boolean {
    if (element &&
        element.businessObject &&
        element.businessObject.eventDefinitions &&
        element.businessObject.eventDefinitions[0].$type === 'bpmn:MessageEventDefinition') {
      return true;
    } else {
      return false;
    }
  }

  private init(): void {
    if (this.businessObjInPanel.eventDefinitions
      && this.businessObjInPanel.eventDefinitions[0].$type === 'bpmn:MessageEventDefinition') {
        const messageElement: IMessageElement = this.businessObjInPanel.eventDefinitions[0];

        if (messageElement.messageRef) {
          this.selectedId = messageElement.messageRef.id;
          this.updateMessage();
        } else {
          this.selectedMessage = null;
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

  private getMessages(): Promise<Array<IMessage>> {
    return new Promise((resolve: Function, reject: Function): void => {

      this.moddle.fromXML(this.getXML(), (err: Error, definitions: IDefinition) => {
        const rootElements: Array<IModdleElement> = definitions.get('rootElements');
        const messages: Array<IMessage> = rootElements.filter((element: IModdleElement) => {
          return element.$type === 'bpmn:Message';
        });

        resolve(messages);
      });
    });
  }

  private updateMessage(): void {
    this.selectedMessage = this.messages.find((message: IMessage) => {
      return message.id === this.selectedId;
    });

    const messageElement: IMessageElement = this.businessObjInPanel.eventDefinitions[0];
    messageElement.messageRef = this.selectedMessage;
  }

  private updateName(): void {
    this.moddle.fromXML(this.getXML(), (err: Error, definitions: IDefinition) => {

      const rootElements: Array<IModdleElement> = definitions.get('rootElements');
      const message: IMessage = rootElements.find((element: any) => {
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

      const bpmnMessage: IMessage = this.moddle.create('bpmn:Message',
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

  private clearName(): void {
    this.selectedMessage.name = '';
  }

}
