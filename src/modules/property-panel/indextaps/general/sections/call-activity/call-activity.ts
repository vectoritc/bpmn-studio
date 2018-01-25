import {IEvent,
  IEventBus,
  IModdleElement,
  IPageModel,
  ISection} from '../../../../../../contracts';

export class CallActivitySection implements ISection {

  public path: string = '/sections/call-activity/call-activity';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IModdleElement;
  private eventBus: IEventBus;

  public selectedOption: string;
  public selectedBinding: number;
  public callActivity: IModdleElement;

  public async activate(model: IPageModel): Promise<void> {
    this.eventBus = model.modeler.get('eventBus');

    this.eventBus.on('element.click', (event: IEvent) => {
      this.businessObjInPanel = event.element.businessObject;
      this.callActivity = this.businessObjInPanel;
      this.canHandleElement = this.checkElement(this.businessObjInPanel);
    });
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
    } else if (this.selectedBinding === 2) {
      this.businessObjInPanel.calledElementBinding = 'deployment';
      this.businessObjInPanel.calledElementVersion = undefined;
    } else if (this.selectedBinding === 3) {
      this.businessObjInPanel.calledElementVersion = this.callActivity.calledElementVersion;
      this.businessObjInPanel.calledElementBinding = 'version';
    }
  }
}
