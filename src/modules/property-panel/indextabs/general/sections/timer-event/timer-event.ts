import {
  IBpmnModdle,
  IBpmnModeler,
  IModdleElement,
  IPageModel,
  ISection,
  IShape,
} from '../../../../../../contracts';

enum TimerType {
  Date = 1,
  Duration = 2,
  Cycle = 3,
}

export class TimerEventSection implements ISection {

  public path: string = '/sections/timer-event/timer-event';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IModdleElement;
  private moddle: IBpmnModdle;
  private modeler: IBpmnModeler;

  private isBoundaryEvent: boolean = true;

  public timerElement: IModdleElement;
  public timerType: TimerType;

  public async activate(model: IPageModel): Promise<void> {
    this.businessObjInPanel = model.elementInPanel.businessObject;

    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;
    this.timerElement = this._getTimerElement();

    this._init();
  }

  private _init(): void {
    const {timeDate, timeDuration, timeCycle} = this.businessObjInPanel.eventDefinitions[0];

    if ((timeDate === undefined)
        && (timeDuration === undefined)
        && (timeCycle === undefined)) {
      return;
    }

    if (timeCycle !== undefined) {
      this.timerType = TimerType.Cycle;
      return;
    }

    if (timeDuration !== undefined) {
      this.timerType = TimerType.Duration;
      return;
    }

    if (timeDate !== undefined) {
      this.timerType = TimerType.Date;
      return;
    }
  }

  private _getTimerElement(): IModdleElement {
    const {timeDuration, timeDate, timeCycle} = this.businessObjInPanel.eventDefinitions[0];

    if (timeDuration !== undefined) {
       return timeDuration;
    }
    if (timeDate !== undefined) {
      return timeDate;
    }
    if (timeCycle !== undefined) {
      return timeCycle;
    }

    const timerEventDefinition: IModdleElement = this.moddle.create('bpmn:FormalExpression', {body: ''});
    return timerEventDefinition;
  }

  public isSuitableForElement(element: IShape): boolean {
    if (this._elementIsTimerEvent(element)) {
      this.isBoundaryEvent = this._elementIsBoundaryEvent(element);
      return true;
    }
    return false;
  }

  private _elementIsTimerEvent(element: IShape): boolean {
    return element !== undefined
        && element.businessObject !== undefined
        && element.businessObject.eventDefinitions !== undefined
        && element.businessObject.eventDefinitions[0].$type === 'bpmn:TimerEventDefinition';
  }

  private _elementIsBoundaryEvent(element: IShape): boolean {
    return element !== undefined
        && element.businessObject !== undefined
        && element.businessObject.$type === 'bpmn:BoundaryEvent';
  }

  public updateTimerType(): void {
    const moddleElement: IModdleElement = this.moddle.create('bpmn:FormalExpression', {body: this.timerElement.body});
    const timerTypeObject: Object = {
      timeDate: (this.timerType === TimerType.Date) ? moddleElement : undefined,
      timeDuration: (this.timerType === TimerType.Duration) ? moddleElement : undefined,
      timeCycle: (this.timerType === TimerType.Cycle) ? moddleElement : undefined,
    };

    Object.assign(this.businessObjInPanel.eventDefinitions[0], timerTypeObject);
  }

  public updateTimerDefinition(): void {
    const timeElement: IModdleElement = this._getTimerElement();
    timeElement.body = this.timerElement.body;
  }

  public clearDefinition(): void {
    this.timerElement.body = '';
  }
}
