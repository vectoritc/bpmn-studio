import {IBpmnModdle,
  IBpmnModeler,
  IBpmnModelerConstructor,
  IDefinition,
  IEvent,
  IEventBus,
  IModdleElement,
  IModeling,
  IPageModel,
  ISection,
  IShape} from '../../../../../../contracts';

export class MessageEventSection implements ISection {

  public path: string = '/sections/message-event/message-event';
  public canHandleElement: boolean = false;

  private elementInPanel: IShape;
  private businessObjInPanel: IModdleElement;
  private eventBus: IEventBus;
  private modeling: IModeling;
  private moddle: IBpmnModdle;
  private xml: string;

  public messages: Array<IModdleElement>;
  public selectedId: string;
  public selectedMessage: IModdleElement;

  public async activate(model: IPageModel): Promise<void> {
    this.eventBus = model.modeler.get('eventBus');
    this.modeling = model.modeler.get('modeling');
    this.moddle = model.modeler.get('moddle');

    this.xml = await this.getXML(model.modeler);
    this.messages = await this.getMessages(this.moddle);

    this.eventBus.on('element.click', (event: IEvent) => {
      this.elementInPanel = event.element;
      this.businessObjInPanel = event.element.businessObject;
      if (this.businessObjInPanel.eventDefinitions) {
        this.selectedMessage = this.businessObjInPanel.eventDefinitions[0].messageRef;
        this.selectedId = this.selectedMessage.id;
        console.log(this.businessObjInPanel);
      }
      this.checkElement();
    });
  }

  private getXML(modeler: IBpmnModeler): Promise<string> {
    return new Promise((resolve: Function, reject: Function): void => {

      let xml: string;
      modeler.saveXML({format: true}, (err: Error, diagrammXML: string) => {
        xml = diagrammXML;
      });
      resolve(xml);
    });
  }

  private getMessages(moddle: IBpmnModdle): Promise<Array<IModdleElement>> {
    return new Promise((resolve: Function, reject: Function): void => {

      moddle.fromXML(this.xml, (err: Error, definitions: IDefinition) => {
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

  // needs to be reworked
  private updateId(): void {
    this.modeling.updateProperties(this.elementInPanel, {
      id: this.businessObjInPanel.id,
    });
  }

  private updateDocumentation(): void {
    this.modeling.updateProperties(this.elementInPanel, {
      documentation: this.businessObjInPanel.documentation,
    });
  }
}
