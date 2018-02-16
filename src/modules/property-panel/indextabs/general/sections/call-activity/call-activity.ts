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
  private eventBus: IEventBus;
  private modeler: IBpmnModeler;

  public async activate(model: IPageModel): Promise<void> {
    this.eventBus = model.modeler.get('eventBus');
    this.modeler = model.modeler;

    const selectedEvents: Array<IShape> = this.modeler.get('selection')._selectedElements;
    if (selectedEvents[0]) {
      this.businessObjInPanel = selectedEvents[0].businessObject;
    }

    this.eventBus.on(['element.click', 'shape.changed', 'selection.changed'], (event: IEvent) => {

      if (event.newSelection && event.newSelection.length !== 0) {
        this.businessObjInPanel = event.newSelection[0].businessObject;
      } else if (event.element) {
        this.businessObjInPanel = event.element.businessObject;
      }
    });

  }

  public checkElement(element: IShape): boolean {
    if (element &&
        element.businessObject &&
        element.businessObject.$type === 'bpmn:CallActivity') {
          return true;
        } else {
          return false;
        }
  }

  private clearCalledElement(): void {
    this.businessObjInPanel.calledElement = '';
  }
}
