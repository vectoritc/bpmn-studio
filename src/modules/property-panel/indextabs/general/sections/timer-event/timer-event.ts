import {
  IBpmnModdle,
  IBpmnModeler,
  IDefinition,
  IElementRegistry,
  IEscalation,
  IEscalationElement,
  IModdleElement,
  IPageModel,
  ISection,
  IShape,
} from '../../../../../../contracts';
import {ITimerElement} from './../../../../../../contracts/bpmnmodeler/bpmnElements/ITimerElement';

export class TimerEventSection implements ISection {

  public path: string = '/sections/timer-event/timer-event';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IModdleElement;
  private moddle: IBpmnModdle;
  private modeler: IBpmnModeler;

  private escalationCodeVariable: string;
  private isBoundaryEvent: boolean = true;

  public selectedId: string;
  public timerElement: any;

  public async activate(model: IPageModel): Promise<void> {
    this.businessObjInPanel = model.elementInPanel.businessObject;

    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;
    this.timerElement = this._getTimerElement();
  }

  private _getTimerElement(): ITimerElement {
    if (this.businessObjInPanel.eventDefinitions[0].timeDuration !== undefined) {
      return this.businessObjInPanel.eventDefinitions[0].timeDuration;
    } else if (this.businessObjInPanel.eventDefinitions[0].timeDate !== undefined) {
      return this.businessObjInPanel.eventDefinitions[0].timeDate;
    } else if (this.businessObjInPanel.eventDefinitions[0].timeCycle !== undefined) {
      return this.businessObjInPanel.eventDefinitions[0].timeCycle;
    }
  }

  public isSuitableForElement(element: IShape): boolean {
    if (this.elementIsTimerEvent(element)) {
      this.isBoundaryEvent = this.elementIsBoundaryEvent(element);
      return true;
    }
    return false;
  }

  private elementIsTimerEvent(element: IShape): boolean {
    return element !== undefined
        && element.businessObject !== undefined
        && element.businessObject.eventDefinitions !== undefined
        && element.businessObject.eventDefinitions[0].$type === 'bpmn:TimerEventDefinition';
  }

  private elementIsBoundaryEvent(element: IShape): boolean {
    return element !== undefined
        && element.businessObject !== undefined
        && element.businessObject.$type === 'bpmn:BoundaryEvent';
  }

  public updateTimerType(): void {
    switch (this.selectedId) {
      case undefined:
        this.businessObjInPanel.eventDefinitions[0].timeDuration = undefined;
        this.businessObjInPanel.eventDefinitions[0].timeCycle = undefined;
        this.businessObjInPanel.eventDefinitions[0].timeDate = undefined;
        break;
      case '1':
        this.businessObjInPanel.eventDefinitions[0].timeDate.$type = 'bpmn:FormalExpression';
        this.businessObjInPanel.eventDefinitions[0].timeDate.body = this.timerElement.body;
        this.businessObjInPanel.eventDefinitions[0].timeDuration = undefined;
        this.businessObjInPanel.eventDefinitions[0].timeCycle = undefined;
        break;
      case '2':
        this.businessObjInPanel.eventDefinitions[0].timeDuration.$type = 'bpmn:FormalExpression';
        this.businessObjInPanel.eventDefinitions[0].timeDuration.body = this.timerElement.body;
        this.businessObjInPanel.eventDefinitions[0].timeCycle = undefined;
        this.businessObjInPanel.eventDefinitions[0].timeDate = undefined;
        break;
      case '3':
        this.businessObjInPanel.eventDefinitions[0].timeCycle.$type = 'bpmn:FormalExpression';
        this.businessObjInPanel.eventDefinitions[0].timeCycle.body = this.timerElement.body;
        this.businessObjInPanel.eventDefinitions[0].timeDuration = undefined;
        this.businessObjInPanel.eventDefinitions[0].timeDate = undefined;
        break;
      default:
        break;
    }
  }

  public updateTimerDefinition(): void {
    const timeElement: ITimerElement = this._getTimerElement();
    timeElement.body = this.timerElement.body;
  }

  public clearDefinition(): void {
    this.timerElement.body = '';
  }
}
