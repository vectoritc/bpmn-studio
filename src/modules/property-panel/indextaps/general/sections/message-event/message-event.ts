import {IBpmnModdle,
  IBpmnModeler,
  IDefinition,
  IEvent,
  IEventBus,
  IModdleElement,
  IPageModel,
  ISection} from '../../../../../../contracts';

import {bindable, observable} from 'aurelia-framework';

export class MessageEventSection implements ISection {

  public path: string = '/sections/message-event/message-event';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IModdleElement;
  private eventBus: IEventBus;
  private moddle: IBpmnModdle;
  private modeler: IBpmnModeler;
  private msgDropdown: HTMLSelectElement;

  @observable public messages: Array<IModdleElement>;
  @bindable public selectedId: string;
  public selectedMessage: IModdleElement;

  public async activate(model: IPageModel): Promise<void> {
    this.eventBus = model.modeler.get('eventBus');
    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;

    this.messages = await this.getMessages();

    this.eventBus.on('element.click', (event: IEvent) => {
      this.businessObjInPanel = event.element.businessObject;

      if (this.businessObjInPanel.eventDefinitions && this.businessObjInPanel.eventDefinitions[0].messageRef) {
        this.selectedMessage = this.businessObjInPanel.eventDefinitions[0].messageRef;
        this.selectedId = this.selectedMessage.id;
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
    this.businessObjInPanel.eventDefinitions[0].messageRef.name = this.selectedMessage.name;
  }

  private async addMessage(): Promise<void> {
    this.moddle.fromXML(this.getXML(), (err: Error, definitions: IDefinition) => {
      const bpmnMessage: IModdleElement = this.moddle.create('bpmn:Message', { id: `Message_${this.random()}`, name: 'Message Name' });
      definitions.get('rootElements').push(bpmnMessage);
      this.moddle.toXML(definitions, (error: Error, xmlStrUpdated: string) => {
        this.modeler.importXML(xmlStrUpdated, (errr: Error) => {
         this.refreshMessages();
         return 0;
        });
      });
    });
  }

  private async refreshMessages(): Promise<void> {
    this.messages = await this.getMessages();
  }

  private random(): string {
    let random: string = '';
    const possible: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i: number = 0; i < 8; i++) {
      random += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return random;
  }

}
