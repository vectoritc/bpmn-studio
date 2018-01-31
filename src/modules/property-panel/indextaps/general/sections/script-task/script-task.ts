import {IBpmnModeler,
  IEvent,
  IEventBus,
  IModdleElement,
  IPageModel,
  IScriptTaskElement,
  ISection,
  IShape} from '../../../../../../contracts';

export class ScriptTaskSection implements ISection {

  public path: string = '/sections/script-task/script-task';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IScriptTaskElement;
  private eventBus: IEventBus;
  private modeler: IBpmnModeler;

  public scriptTask: IScriptTaskElement;

  public async activate(model: IPageModel): Promise<void> {
    this.eventBus = model.modeler.get('eventBus');
    this.modeler = model.modeler;

    const selectedEvents: Array<IShape> = this.modeler.get('selection')._selectedElements;
    if (selectedEvents[0]) {
      this.businessObjInPanel = selectedEvents[0].businessObject;
      this.init();
    }

    this.eventBus.on(['element.click', 'shape.changed'], (event: IEvent) => {
      this.businessObjInPanel = event.element.businessObject;
      this.init();
    });
  }

  private init(): void {
    this.scriptTask = this.businessObjInPanel;
    this.canHandleElement = this.checkElement(this.businessObjInPanel);
  }

  public checkElement(element: IModdleElement): boolean {
    if (element &&
        element.$type === 'bpmn:ScriptTask') {
      return true;
    } else {
      return false;
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
