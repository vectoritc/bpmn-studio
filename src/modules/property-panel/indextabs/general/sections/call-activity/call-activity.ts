import {IPagination, IProcessDefEntity} from '@process-engine/bpmn-studio_client';
import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {
  IBpmnModeler,
  ICallActivityElement,
  IPageModel,
  ISection,
  IShape,
} from '../../../../../../contracts';
import environment from '../../../../../../environment';
import {GeneralService} from '../../service/general.service';

@inject(GeneralService, Router, EventAggregator)
export class CallActivitySection implements ISection {

  public path: string = '/sections/call-activity/call-activity';
  public canHandleElement: boolean = false;
  public allProcesses: IPagination<IProcessDefEntity>;
  public selectedProcess: IProcessDefEntity;

  private _businessObjInPanel: ICallActivityElement;
  private _generalService: GeneralService;
  private _router: Router;
  private _eventAggregator: EventAggregator;

  constructor(generalService?: GeneralService, router?: Router, eventAggregator?: EventAggregator) {
    this._generalService = generalService;
    this._router = router;
    this._eventAggregator = eventAggregator;
  }

  public async activate(model: IPageModel): Promise<void> {
    this._businessObjInPanel = model.elementInPanel.businessObject;
    await this._getAllProcesses();
    this.selectedProcess = this.allProcesses.data.find((process: IProcessDefEntity) => {
      return process.key === this._businessObjInPanel.calledElement;
    });
  }

  public isSuitableForElement(element: IShape): boolean {
    const elementIsCallActivity: boolean = element !== undefined
                                        && element.businessObject !== undefined
                                        && element.businessObject.$type === 'bpmn:CallActivity';

    return elementIsCallActivity;
  }

  public navigateToCalledProcess(): void {
    this._router.navigateToRoute('processdef-detail', {
      processDefId: this.selectedProcess.id,
    });
  }

  public updateCalledProcess(): void {
    this._businessObjInPanel.calledElement = this.selectedProcess.key;
    this._publishDiagramChange();
  }

  private async _getAllProcesses(): Promise<void> {
    this.allProcesses = await this._generalService.getAllProcesses();
  }

  private _publishDiagramChange(): void {
    this._eventAggregator.publish(environment.events.diagramChange);
  }
}
