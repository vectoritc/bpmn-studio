import {
  IBpmnModdle,
  IBpmnModeler,
  IModdleElement,
  IPageModel,
  ISection,
  IShape,
} from '../../../../../../contracts';

export class TimerEventSection implements ISection {

  public path: string = '/sections/timer-event/timer-event';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IModdleElement;
  private moddle: IBpmnModdle;
  private modeler: IBpmnModeler;

  private isBoundaryEvent: boolean = true;

  public selectedId: number;
  public timerElement: IModdleElement;

  public async activate(model: IPageModel): Promise<void> {
    this.businessObjInPanel = model.elementInPanel.businessObject;

    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;
    this.timerElement = this._getTimerElement();

    this._init();
  }

  private _init(): void {
    const elementHasNoTimeDate: boolean = this.businessObjInPanel.eventDefinitions[0].timeDate === undefined;
    const elementHasNoTimeDuration: boolean = this.businessObjInPanel.eventDefinitions[0].timeDuration === undefined;
    const elementHasNoTimeCycle: boolean = this.businessObjInPanel.eventDefinitions[0].timeCycle === undefined;

    if (elementHasNoTimeCycle && elementHasNoTimeDate && elementHasNoTimeDuration) {
      return;
    }

    if (!elementHasNoTimeCycle) {
      this.selectedId = 3; // tslint:disable-line:no-magic-numbers
    } else if (!elementHasNoTimeDuration) {
      this.selectedId = 2; // tslint:disable-line:no-magic-numbers
    } else if (!elementHasNoTimeDate) {
      this.selectedId = 1;
    } else {
      this.selectedId = undefined;
    }

  }

  private _getTimerElement(): IModdleElement {
    if (this.businessObjInPanel.eventDefinitions[0].timeDuration !== undefined) {
      return this.businessObjInPanel.eventDefinitions[0].timeDuration;
    } else if (this.businessObjInPanel.eventDefinitions[0].timeDate !== undefined) {
      return this.businessObjInPanel.eventDefinitions[0].timeDate;
    } else if (this.businessObjInPanel.eventDefinitions[0].timeCycle !== undefined) {
      return this.businessObjInPanel.eventDefinitions[0].timeCycle;
    } else {
      const timerEventDefinition: IModdleElement = this.moddle.create('bpmn:FormalExpression', {body: ''});
      return timerEventDefinition;
    }
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
    switch (this.selectedId) {
      case undefined:
        this.businessObjInPanel.eventDefinitions[0].timeDuration = undefined;
        this.businessObjInPanel.eventDefinitions[0].timeCycle = undefined;
        this.businessObjInPanel.eventDefinitions[0].timeDate = undefined;
        break;
      case 1:
        const timeDate: IModdleElement = this.moddle.create('bpmn:FormalExpression', {body: this.timerElement.body});

        this.businessObjInPanel.eventDefinitions[0].timeDate = timeDate;
        this.businessObjInPanel.eventDefinitions[0].timeDuration = undefined;
        this.businessObjInPanel.eventDefinitions[0].timeCycle = undefined;
        break;
      // tslint:disable-next-line:no-magic-numbers
      case 2:
        const timeDuration: IModdleElement = this.moddle.create('bpmn:FormalExpression', {body: this.timerElement.body});

        this.businessObjInPanel.eventDefinitions[0].timeDuration = timeDuration;
        this.businessObjInPanel.eventDefinitions[0].timeCycle = undefined;
        this.businessObjInPanel.eventDefinitions[0].timeDate = undefined;
        break;
      // tslint:disable-next-line:no-magic-numbers
      case 3:
        const timeCycle: IModdleElement = this.moddle.create('bpmn:FormalExpression', {body: this.timerElement.body});

        this.businessObjInPanel.eventDefinitions[0].timeCycle = timeCycle;
        this.businessObjInPanel.eventDefinitions[0].timeDuration = undefined;
        this.businessObjInPanel.eventDefinitions[0].timeDate = undefined;
        break;
      default:
        break;
    }
  }

  public updateTimerDefinition(): void {
    const timeElement: IModdleElement = this._getTimerElement();
    timeElement.body = this.timerElement.body;
  }

  public clearDefinition(): void {
    this.timerElement.body = '';
  }
}
