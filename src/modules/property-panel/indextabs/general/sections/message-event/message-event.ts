import {
  IBpmnModdle,
  IBpmnModeler,
  IDefinition,
  IElementRegistry,
  IMessage,
  IMessageElement,
  IModdleElement,
  IPageModel,
  ISection,
  IShape,
} from '../../../../../../contracts';

import {inject} from 'aurelia-framework';
import {GeneralService} from '../../service/general.service';

@inject(GeneralService)
export class MessageEventSection implements ISection {

  public path: string = '/sections/message-event/message-event';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IMessageElement;
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
    this.businessObjInPanel = model.elementInPanel.businessObject;

    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;

    this.messages = await this.getMessages();

    this.init();
  }

  public isSuitableForElement(element: IShape): boolean {
    return this.elementIsMessageEvent(element);
  }

  private elementIsMessageEvent(element: IShape): boolean {
    return element !== undefined
        && element.businessObject !== undefined
        && element.businessObject.eventDefinitions !== undefined
        && element.businessObject.eventDefinitions[0].$type === 'bpmn:MessageEventDefinition';
  }

  private init(): void {
    const eventDefinitions: Array<IModdleElement> = this.businessObjInPanel.eventDefinitions;
    const businessObjectHasNoMessageEvents: boolean = eventDefinitions === undefined
                                                   || eventDefinitions === null
                                                   || eventDefinitions[0].$type !== 'bpmn:MessageEventDefinition';
    if (businessObjectHasNoMessageEvents) {
      return;
    }

    const messageElement: IMessageElement = this.businessObjInPanel.eventDefinitions[0];
    const elementReferencesMessage: boolean = messageElement.messageRef !== undefined
                                           && messageElement.messageRef !== null;

    if (elementReferencesMessage) {
      this.selectedId = messageElement.messageRef.id;
      this.updateMessage();
    } else {
      this.selectedMessage = null;
      this.selectedId = null;
    }
  }

  private getMessages(): Array<IMessage> {
    const rootElements: Array<IModdleElement> = this.modeler._definitions.rootElements;
    const messages: Array<IMessage> = rootElements.filter((element: IModdleElement) => {
      return element.$type === 'bpmn:Message';
    });

    return messages;
  }

  private updateMessage(): void {
    this.selectedMessage = this.messages.find((message: IMessage) => {
      return message.id === this.selectedId;
    });

    const messageElement: IMessageElement = this.businessObjInPanel.eventDefinitions[0];
    messageElement.messageRef = this.selectedMessage;
  }

  private updateName(): void {
    const rootElements: Array<IModdleElement> = this.modeler._definitions.rootElements;
    const elementIsSelectedMessage: IMessage = rootElements.find((element: IModdleElement) => {
      return element.$type === 'bpmn:Message' && element.id === this.selectedId;
    });

    elementIsSelectedMessage.name = this.selectedMessage.name;
  }

  private addMessage(): void {
    const bpmnMessageProperty: Object = {
      id: `Message_${this.generalService.generateRandomId()}`,
      name: 'Message Name',
    };
    const bpmnMessage: IMessage = this.moddle.create('bpmn:Message', bpmnMessageProperty);

    this.modeler._definitions.rootElements.push(bpmnMessage);

    this.moddle.toXML(this.modeler._definitions.rootElements, (toXMLError: Error, xmlStrUpdated: string) => {
      this.modeler.importXML(xmlStrUpdated, async(errr: Error) => {
        await this.refreshMessages();
        await this.setBusinessObj();
        this.selectedId = bpmnMessage.id;
        this.updateMessage();
      });
    });
  }

  private async refreshMessages(): Promise<void> {
    this.messages = await this.getMessages();
  }

  private setBusinessObj(): void {
    const elementRegistry: IElementRegistry = this.modeler.get('elementRegistry');
    const elementInPanel: IShape = elementRegistry.get(this.businessObjInPanel.id);
    this.businessObjInPanel = elementInPanel.businessObject;
  }

  private clearName(): void {
    this.selectedMessage.name = '';
  }
}
