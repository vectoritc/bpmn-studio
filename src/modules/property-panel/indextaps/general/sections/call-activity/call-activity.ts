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

  public selectedOption: string;
  public selectedBinding: number;
  public callActivity: ICallActivityElement;

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
    this.callActivity = this.businessObjInPanel;
    this.canHandleElement = this.checkElement(this.businessObjInPanel);
  }

  public checkElement(element: IModdleElement): boolean {
    if (element &&
        element.$type === 'bpmn:CallActivity') {
      return true;
    } else {
      return false;
    }
  }

  private updateCalledElement(): void {
    this.businessObjInPanel.calledElement = this.callActivity.calledElement;
  }

  private updateTenantId(): void {
    this.businessObjInPanel.calledElementTenantId = this.callActivity.calledElementTenantId;
  }

  private updateVariableMappingClass(): void {
    this.businessObjInPanel.variableMappingClass = this.callActivity.variableMappingClass;
    this.businessObjInPanel.variableMappingDelegateExpression = undefined;
  }

  private updateVariableMappingDelegateExpression(): void {
    this.businessObjInPanel.variableMappingDelegateExpression = this.callActivity.variableMappingDelegateExpression;
    this.businessObjInPanel.variableMappingClass = undefined;
  }

  private updateBinding(): void {
    if (this.selectedBinding === 1) {
      this.businessObjInPanel.calledElementBinding = 'latest';
      this.businessObjInPanel.calledElementVersion = undefined;
    } else if (this.selectedBinding === 2) { // tslint:disable-line
      this.businessObjInPanel.calledElementBinding = 'deployment';
      this.businessObjInPanel.calledElementVersion = undefined;
    } else if (this.selectedBinding === 3) { // tslint:disable-line
      this.businessObjInPanel.calledElementVersion = this.callActivity.calledElementVersion;
      this.businessObjInPanel.calledElementBinding = 'version';
    }
  }
}
