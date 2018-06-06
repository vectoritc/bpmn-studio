import {IPagination, IProcessDefEntity} from '@process-engine/bpmn-studio_client';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {
  IBpmnModeler,
  ICallActivityElement,
  IPageModel,
  ISection,
  IShape,
} from '../../../../../../contracts';
import {GeneralService} from '../../service/general.service';

@inject(GeneralService, Router)
export class CallActivitySection implements ISection {

  public path: string = '/sections/call-activity/call-activity';
  public canHandleElement: boolean = false;
  public allProcesses: IPagination<IProcessDefEntity>;
  public selectedProcess: IProcessDefEntity;

  private _modeler: IBpmnModeler;
  private _businessObjInPanel: ICallActivityElement;
  private _generalService: GeneralService;
  private _router: Router;

  constructor(generalService?: GeneralService, router?: Router) {
    this._generalService = generalService;
    this._router = router;
  }

  public async activate(model: IPageModel): Promise<void> {
    this._businessObjInPanel = model.elementInPanel.businessObject;
    this._modeler = model.modeler;
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
    this._router.navigate(`/processdef/${this.selectedProcess.id}/detail`);
  }

  public updateCalledProcess(): void {
    this._businessObjInPanel.calledElement = this.selectedProcess.key;
  }

  private async _getAllProcesses(): Promise<void> {
    this.allProcesses = await this._generalService.getAllProcesses();
  }
}
