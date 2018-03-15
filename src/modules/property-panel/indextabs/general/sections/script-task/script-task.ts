import {IPageModel, IScriptTaskElement, ISection, IShape} from '../../../../../../contracts';

export class ScriptTaskSection implements ISection {

  public path: string = '/sections/script-task/script-task';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IScriptTaskElement;

  public activate(model: IPageModel): void {
    this.businessObjInPanel = model.elementInPanel.businessObject;
  }

  public isSuitableForElement(element: IShape): boolean {
    return this.elementIsScriptTask(element);
  }

  private elementIsScriptTask(element: IShape): boolean {
    return element !== undefined
        && element.businessObject !== undefined
        && element.businessObject.$type === 'bpmn:ScriptTask';
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
