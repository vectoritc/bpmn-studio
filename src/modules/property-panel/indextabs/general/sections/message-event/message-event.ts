import {
  IBpmnModdle,
  IBpmnModeler,
  IElementRegistry,
  IMessage,
  IMessageElement,
  IModdleElement,
  IPageModel,
  ISection,
  IShape,
} from '../../../../../../contracts';

import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import environment from '../../../../../../environment';
import {GeneralService} from '../../service/general.service';

@inject(GeneralService, EventAggregator)
export class MessageEventSection implements ISection {

  public path: string = '/sections/message-event/message-event';
  public canHandleElement: boolean = false;
  public messages: Array<IMessage>;
  public selectedId: string;
  public selectedMessage: IMessage;

  private _businessObjInPanel: IMessageElement;
  private _moddle: IBpmnModdle;
  private _modeler: IBpmnModeler;
  private _generalService: GeneralService;
  private _eventAggregator: EventAggregator;

  constructor(generalService?: GeneralService, eventAggregator?: EventAggregator) {
    this._generalService = generalService;
    this._eventAggregator = eventAggregator;
  }

  public async activate(model: IPageModel): Promise<void> {
    this._businessObjInPanel = model.elementInPanel.businessObject;

    this._moddle = model.modeler.get('moddle');
    this._modeler = model.modeler;

    this.messages = await this._getMessages();

    this._init();
  }

  public isSuitableForElement(element: IShape): boolean {
    return this._elementIsMessageEvent(element);
  }

  public updateMessage(): void {
    this.selectedMessage = this.messages.find((message: IMessage) => {
      return message.id === this.selectedId;
    });

    const messageElement: IMessageElement = this._businessObjInPanel.eventDefinitions[0];
    messageElement.messageRef = this.selectedMessage;
    this._publishDiagramChange();
  }

  public updateName(): void {
    const rootElements: Array<IModdleElement> = this._modeler._definitions.rootElements;
    const selectedMessage: IMessage = rootElements.find((element: IModdleElement) => {
      const elementIsSelectedMessage: boolean = element.$type === 'bpmn:Message' && element.id === this.selectedId;

      return elementIsSelectedMessage;
    });

    selectedMessage.name = this.selectedMessage.name;
    this._publishDiagramChange();
  }

  public addMessage(): void {
    const bpmnMessageProperty: Object = {
      id: `Message_${this._generalService.generateRandomId()}`,
      name: 'Message Name',
    };
    const bpmnMessage: IMessage = this._moddle.create('bpmn:Message', bpmnMessageProperty);

    this._modeler._definitions.rootElements.push(bpmnMessage);

    this._moddle.toXML(this._modeler._definitions.rootElements, (toXMLError: Error, xmlStrUpdated: string) => {
      this._modeler.importXML(xmlStrUpdated, async(importXMLError: Error) => {
        await this._refreshMessages();
        await this._setBusinessObj();

        this.selectedId = bpmnMessage.id;
        this.updateMessage();
      });
    });
    this._publishDiagramChange();
  }

  private _elementIsMessageEvent(element: IShape): boolean {
    return element !== undefined
        && element.businessObject !== undefined
        && element.businessObject.eventDefinitions !== undefined
        && element.businessObject.eventDefinitions[0].$type === 'bpmn:MessageEventDefinition';
  }

  private _init(): void {
    const eventDefinitions: Array<IModdleElement> = this._businessObjInPanel.eventDefinitions;
    const businessObjectHasNoMessageEvents: boolean = eventDefinitions === undefined
                                                   || eventDefinitions === null
                                                   || eventDefinitions[0].$type !== 'bpmn:MessageEventDefinition';
    if (businessObjectHasNoMessageEvents) {
      return;
    }

    const messageElement: IMessageElement = this._businessObjInPanel.eventDefinitions[0];
    const elementReferencesMessage: boolean = messageElement.messageRef !== undefined
                                           && messageElement.messageRef !== null;

    if (elementReferencesMessage) {
      this.selectedId = messageElement.messageRef.id;
      this.updateMessage();
    } else {
      this.selectedMessage = undefined;
      this.selectedId = undefined;
    }
  }

  private _getMessages(): Array<IMessage> {
    const rootElements: Array<IModdleElement> = this._modeler._definitions.rootElements;
    const messages: Array<IMessage> = rootElements.filter((element: IModdleElement) => {
      return element.$type === 'bpmn:Message';
    });

    return messages;
  }

  private async _refreshMessages(): Promise<void> {
    this.messages = await this._getMessages();
  }

  private _setBusinessObj(): void {
    const elementRegistry: IElementRegistry = this._modeler.get('elementRegistry');
    const elementInPanel: IShape = elementRegistry.get(this._businessObjInPanel.id);

    this._businessObjInPanel = elementInPanel.businessObject;
  }

  private _publishDiagramChange(): void {
    this._eventAggregator.publish(environment.events.diagramChange);
  }
}
