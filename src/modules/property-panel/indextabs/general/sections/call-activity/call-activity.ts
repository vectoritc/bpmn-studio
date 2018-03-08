import {IPagination, IProcessDefEntity} from '@process-engine/consumer_client';
import {inject} from 'aurelia-framework';
import {
  ICallActivityElement,
  IPageModel,
  ISection,
  IShape,
} from '../../../../../../contracts';
import {GeneralService} from '../../service/general.service';

@inject(GeneralService)
export class CallActivitySection implements ISection {

  public path: string = '/sections/call-activity/call-activity';
  public canHandleElement: boolean = false;

  public allProcesses: IPagination<IProcessDefEntity>;

  private businessObjInPanel: ICallActivityElement;
  private generalService: GeneralService;

  constructor(generalService: GeneralService) {
    this.generalService = generalService;
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

  private clearCalledElement(): void {
    this.businessObjInPanel.calledElement = '';
  }

  private async _getAllProcesses(): Promise<void> {
    this.allProcesses = await this.generalService.getAllProcesses();
  }
}
