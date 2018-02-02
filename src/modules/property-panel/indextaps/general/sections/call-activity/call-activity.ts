import { observable } from 'aurelia-framework';
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

  @observable public selectedOption: number;
  @observable public selectedBinding: number;
  public callActivity: ICallActivityElement;

  public async activate(model: IPageModel): Promise<void> {
    this.eventBus = model.modeler.get('eventBus');
    this.modeler = model.modeler;

    const selectedEvents: Array<IShape> = this.modeler.get('selection')._selectedElements;
    if (selectedEvents[0]) {
      this.businessObjInPanel = selectedEvents[0].businessObject;
      this.init();
    }

    this.eventBus.on(['element.click', 'shape.changed', 'selection.changed'], (event: IEvent) => {
      if (event.newSelection && event.newSelection.length !== 0) {
        this.businessObjInPanel = event.newSelection[0].businessObject;
      } else if (event.element) {
        this.businessObjInPanel = event.element.businessObject;
      }
      this.init();
    });
  }

  private init(): void {
    this.callActivity = this.businessObjInPanel;
    this.canHandleElement = this.checkElement(this.businessObjInPanel);
    if (this.businessObjInPanel.calledElementBinding) {
      if (this.businessObjInPanel.calledElementBinding === 'latest') {
        this.selectedBinding = 1;
      } else if (this.businessObjInPanel.calledElementBinding === 'deployment') {
        this.selectedBinding = 2; // tslint:disable-line
      } else if (this.businessObjInPanel.calledElementBinding === 'version') {
        this.selectedBinding = 3; // tslint:disable-line
      }
    } else {
      this.businessObjInPanel.calledElementBinding = 'latest';
    }

    if (this.businessObjInPanel.variableMappingClass !== undefined) {
      this.selectedOption = 1;
    } else if (this.businessObjInPanel.variableMappingDelegateExpression !== undefined) {
      this.selectedOption = 2; // tslint:disable-line
    }
  }

  public checkElement(element: IModdleElement): boolean {
    if (element &&
        element.$type === 'bpmn:CallActivity') {
      return true;
    } else {
      return false;
    }
  }

  private selectedOptionChanged(newValue: number, oldValue: number): void {
    if (newValue === 1) {
      this.businessObjInPanel.variableMappingDelegateExpression = undefined;
    } else if (newValue === 2) { // tslint:disable-line
      this.businessObjInPanel.variableMappingClass = undefined;
    } else {
      this.businessObjInPanel.variableMappingClass = undefined;
      this.businessObjInPanel.variableMappingDelegateExpression = undefined;
    }
  }

  private selectedBindingChanged(newValue: number, oldValue: number): void {
    if (newValue === 1) {
      this.businessObjInPanel.calledElementBinding = 'latest';
    } else if (newValue === 2) { // tslint:disable-line
      this.businessObjInPanel.calledElementBinding = 'deployment';
    } else if (newValue === 3) { // tslint:disable-line
      this.businessObjInPanel.calledElementBinding = 'version';
    }
  }

}
