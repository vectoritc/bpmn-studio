import {IPagination, IProcessDefEntity} from '@process-engine/consumer_client';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {
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
  public selectedId: string;

  private businessObjInPanel: ICallActivityElement;
  private generalService: GeneralService;
  private router: Router;

  constructor(generalService?: GeneralService, router?: Router) {
    this.generalService = generalService;
    this.router = router;
  }

  public async activate(model: IPageModel): Promise<void> {
    this.businessObjInPanel = model.elementInPanel.businessObject;
    this._getAllProcesses();
  }

  public isSuitableForElement(element: IShape): boolean {
    const elementIsCallActivity: boolean = element !== undefined
                                        && element.businessObject !== undefined
                                        && element.businessObject.$type === 'bpmn:CallActivity';

    return elementIsCallActivity;
  }

  public navigateToCalledProcess(): void {
    this.router.navigate(`/processdef/${this.selectedId}/detail`);
  }

  private clearCalledElement(): void {
    this.businessObjInPanel.calledElement = '';
  }

  private async _getAllProcesses(): Promise<void> {
    this.allProcesses = await this.generalService.getAllProcesses();
  }
}
