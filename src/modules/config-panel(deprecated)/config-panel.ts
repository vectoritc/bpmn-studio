import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, computedFrom, inject} from 'aurelia-framework';
import {OpenIdConnect} from 'aurelia-open-id-connect';
import {Router} from 'aurelia-router';

import {IAuthenticationService} from '../../contracts/authentication/IAuthenticationService';
import {
  AuthenticationStateEvent,
  NotificationType,
} from '../../contracts/index';
import environment from '../../environment';
import {oidcConfig} from '../../open-id-connect-configuration';
import {NotificationService} from '../notification/notification.service';

interface RouteParameters {
  diagramName?: string;
  solutionUri?: string;
}

@inject(Router, 'NotificationService', EventAggregator, 'AuthenticationService', OpenIdConnect, 'InternalProcessEngineBaseRoute')
export class ConfigPanel {
  @bindable public authority: string;
  public readonly defaultAuthority: string = environment.openIdConnect.defaultAuthority;
  public isLoggedInToProcessEngine: boolean;
  public internalProcessEngineBaseRoute: string | null;

  private _router: Router;
  private _notificationService: NotificationService;
  private _eventAggregator: EventAggregator;
  private _authenticationService: IAuthenticationService;
  private _subscriptions: Array<Subscription>;
  // We use any here, because we need to call private members (see below)
  private _openIdConnect: OpenIdConnect | any;
  private _initialAuthority: string;
  private _activeSolutionUri: string;

  constructor(router: Router,
              notificationService: NotificationService,
              eventAggregator: EventAggregator,
              authenticationService: IAuthenticationService,
              openIdConnect: OpenIdConnect,
              internalProcessEngineBaseRoute: string | null,
            ) {

    this._router = router;
    this._notificationService = notificationService;
    this._eventAggregator = eventAggregator;
    this._authenticationService = authenticationService;
    this._openIdConnect = openIdConnect;
    this.internalProcessEngineBaseRoute = internalProcessEngineBaseRoute;
  }

  public activate(routeParameters: RouteParameters): void {

    this._activeSolutionUri = routeParameters.solutionUri;
  }

  public attached(): void {
    const customOpenIdRoute: string = window.localStorage.getItem('openIdRoute');
    const customOpenIdRouteIsSet: boolean = customOpenIdRoute !== null
                                         && customOpenIdRoute !== undefined
                                         && customOpenIdRoute !== '';

    if (customOpenIdRouteIsSet) {
      this.authority = customOpenIdRoute;
    }

    this._initialAuthority = this.authority;
  }

  public detached(): void {
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
  }

  public async updateSettings(): Promise<void> {

    const authorityChanged: boolean = this.authority !== this._initialAuthority;
    if (authorityChanged) {
      this._updateAuthority();
    }

    this._notificationService.showNotification(NotificationType.SUCCESS, 'Successfully saved settings!');

    const solutionUriIsSet: boolean = this._activeSolutionUri !== undefined;
    if (solutionUriIsSet) {
      const solutionUriIsRemote: boolean = this._activeSolutionUri.startsWith('http');

      if (solutionUriIsRemote) {
        this._router.navigateToRoute('start-page');

        return;
      }
    }

    if (authorityChanged) {
      this._router.navigateToRoute('start-page');
    } else {
      this._router.navigateBack();
    }

  }

  public authorityChanged(): void {
    /*
     * TODO: The environment variables should not carry state. This should be done via a configurationService.
     * https://github.com/process-engine/bpmn-studio/issues/673
     */
    environment.openIdConnect.authority = this.authority;
  }

  public setDefaultAuthority(): void {
    this.authority = this.defaultAuthority;
  }

  public cancelUpdate(): void {
    this._router.navigateBack();
  }

  private _updateAuthority(): void {
    const authorityIsSet: boolean = this.authority !== undefined
                                  && this.authority !== null
                                  && this.authority !== '';

    if (authorityIsSet) {
      window.localStorage.setItem('openIdRoute', this.authority);
    }

    oidcConfig.userManagerSettings.authority = this.authority;

    // This dirty way to update the settings is the only way during runtime
    this._openIdConnect.configuration.userManagerSettings.authority = this.authority;
    this._openIdConnect.userManager._settings._authority = this.authority;
  }

}
