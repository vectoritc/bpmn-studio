import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, computedFrom, inject} from 'aurelia-framework';
import {OpenIdConnect} from 'aurelia-open-id-connect';
import {Router} from 'aurelia-router';

import {IAuthenticationService} from '../../contracts/authentication/IAuthenticationService';
import {
  AuthenticationStateEvent,
  ISolutionEntry,
  ISolutionService,
  NotificationType,
} from '../../contracts/index';
import environment from '../../environment';
import {oidcConfig} from '../../open-id-connect-configuration';
import {NotificationService} from '../notification/notification.service';

interface RouteParameters {
  diagramName?: string;
  solutionUri?: string;
}

@inject(Router, 'SolutionService', 'AuthenticationService')
export class ConfigPanel {
  public internalSolution: ISolutionEntry;
  public authority: string;
  public defaultAuthority: string;

  private _router: Router;
  private _solutionService: ISolutionService;
  private _authenticationService: IAuthenticationService;

  constructor(router: Router,
              solutionService: ISolutionService,
              authenticationService: IAuthenticationService) {
    this._router = router;
    this._solutionService = solutionService;
    this._authenticationService = authenticationService;
  }

  public async attached(): Promise<void> {
    const internalSolutionUri: string = window.localStorage.getItem('InternalProcessEngineRoute');

    this.internalSolution = this._solutionService.getSolutionEntryForUri(internalSolutionUri);
    this.authority = this.internalSolution.authority;
    this.defaultAuthority = await this._getAuthorityForInternalSolution();
  }

  public async updateSettings(): Promise<void> {
    const userIsLoggedIn: boolean = await this._authenticationService.isLoggedIn(this.internalSolution.authority, this.internalSolution.identity);

    if (userIsLoggedIn) {
      await this._authenticationService.logout(this.internalSolution.authority, this.internalSolution.identity);
    }

    this.internalSolution.authority = this.authority;

    this._router.navigateBack();
  }

  public setDefaultAuthority(): void {
    this.authority = this.defaultAuthority;
  }

  public cancelUpdate(): void {
    this._router.navigateBack();
  }

  private async _getAuthorityForInternalSolution(): Promise<string> {
      const request: Request = new Request(`${this.internalSolution.uri}/security/authority`, {
        method: 'GET',
        mode: 'cors',
        referrer: 'no-referrer',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });

      const response: Response = await fetch(request);
      const authority: string = (await response.json()).authority;

      return authority;

  }

}
