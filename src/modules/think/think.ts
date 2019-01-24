import {inject} from 'aurelia-framework';

import {ISolutionEntry, ISolutionService, NotificationType} from '../../contracts/index';
import {NotificationService} from '../notification/notification.service';

export interface IThinkRouteParameters {
  view?: string;
  diagramName?: string;
  solutionUri?: string;
}

@inject('SolutionService', 'NotificationService')
export class Think {
  public showDiagramList: boolean = false;

  public activeSolutionEntry: ISolutionEntry;

  private _solutionService: ISolutionService;
  private _notificationService: NotificationService;

  constructor(solutionService: ISolutionService, notificationService: NotificationService) {
    this._solutionService = solutionService;
    this._notificationService = notificationService;
  }

  public async canActivate(routeParameters: IThinkRouteParameters): Promise<boolean> {
    const solutionUriIsSet: boolean = routeParameters.solutionUri !== undefined;

    const solutionUri: string = solutionUriIsSet
                              ? routeParameters.solutionUri
                              : window.localStorage.getItem('InternalProcessEngineRoute');

    this.activeSolutionEntry = this._solutionService.getSolutionEntryForUri(solutionUri);

    const noActiveSolution: boolean = this.activeSolutionEntry === undefined;
    if (noActiveSolution) {
      this._notificationService.showNotification(NotificationType.INFO, 'Please open a solution first.');

      return false;
    }

    await this.activeSolutionEntry.service.openSolution(this.activeSolutionEntry.uri, this.activeSolutionEntry.identity);

    return true;
  }

  public activate(): void {
    this.showDiagramList = true;
  }
}
