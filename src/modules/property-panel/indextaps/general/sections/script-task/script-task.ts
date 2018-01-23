import {IEvent,
  IEventBus,
  IModdleElement,
  IPageModel,
  ISection} from '../../../../../../contracts';

export class ScriptTaskSection implements ISection {

  public path: string = '/sections/script-task/script-task';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IModdleElement;
  private eventBus: IEventBus;

  public scriptTask: IModdleElement;

  public async activate(model: IPageModel): Promise<void> {
    this.eventBus = model.modeler.get('eventBus');

    this.eventBus.on('element.click', (event: IEvent) => {
      this.businessObjInPanel = event.element.businessObject;
      this.scriptTask = this.businessObjInPanel;
      this.checkElement();
    });
  }

  private checkElement(): void {
    if (this.businessObjInPanel &&
        this.businessObjInPanel.$type === 'bpmn:ScriptTask') {
      this.canHandleElement = true;
    } else {
      this.canHandleElement = false;
    }
  }

  private updateScript(): void {
    this.businessObjInPanel.script = this.scriptTask.script;
  }

  private updateFormat(): void {
    this.businessObjInPanel.scriptFormat = this.scriptTask.scriptFormat;
  }

  private updateResult(): void {
    this.businessObjInPanel.resultVariable = this.scriptTask.resultVariable;
  }
}
