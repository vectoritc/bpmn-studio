import {IBpmnModeler,
  ICallActivityElement,
  IEvent,
  IEventBus,
  IModdleElement,
  IPageModel,
  ISection,
  IShape} from '../../../../../../contracts';

export class CallActivitySection implements ISection {

  public path: string = '/sections/call-activity/call-activity';
  public canHandleElement: boolean = false;

  private businessObjInPanel: ICallActivityElement;
  private modeler: IBpmnModeler;

  public async activate(model: IPageModel): Promise<void> {
    this.businessObjInPanel = model.elementInPanel.businessObject;
    this.modeler = model.modeler;
  }

  public isSuitableForElement(element: IShape): boolean {
    const elementIsCallActivity: boolean = element !== undefined
                                        && element.businessObject !== undefined
                                        && element.businessObject.$type === 'bpmn:CallActivity';

    return elementIsCallActivity;
  }

  private clearCalledElement(): void {
    this.businessObjInPanel.calledElement = '';
  }
}
