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
  private modeler: IBpmnModeler;

  public async activate(model: IPageModel): Promise<void> {
    this.businessObjInPanel = model.elementInPanel.businessObject;
    this.modeler = model.modeler;
  }

  public checkElement(element: IShape): boolean {
    if (element &&
        element.businessObject &&
        element.businessObject.$type === 'bpmn:ScriptTask') {
      return true;
    } else {
      return false;
    }
  }

  private clearFormat(): void {
    this.businessObjInPanel.scriptFormat = '';
  }

  private clearScript(): void {
    this.businessObjInPanel.script = '';
  }

  private clearVariable(): void {
    this.businessObjInPanel.resultVariable = '';
  }

}
