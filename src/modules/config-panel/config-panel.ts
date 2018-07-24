import {BpmnStudioClient} from '@process-engine/bpmn-studio_client';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, inject} from 'aurelia-framework';
import {OpenIdConnect} from 'aurelia-open-id-connect';
import {Router} from 'aurelia-router';
import {IAuthenticationService} from '../../contracts/authentication/IAuthenticationService';
import {AuthenticationStateEvent, NotificationType} from '../../contracts/index';
import environment from '../../environment';
import {oidcConfig} from '../../open-id-connect-configuration';
import {NotificationService} from '../notification/notification.service';

@inject(Router, 'NotificationService', EventAggregator, 'NewAuthenticationService', OpenIdConnect)
export class ConfigPanel {

  private _router: Router;
  private _notificationService: NotificationService;
  private _eventAggregator: EventAggregator;
  private _authenticationService: IAuthenticationService;
  private _subscriptions: Array<Subscription>;
  // We use any here, because we need to call private members (see below)
  private _openIdConnect: OpenIdConnect | any;

  public config: typeof environment = environment;
  public isLoggedInToProcessEngine: boolean;
  @bindable() public baseRoute: string;

  constructor(router: Router,
              notificationService: NotificationService,
              eventAggregator: EventAggregator,
              authenticationService: IAuthenticationService,
              openIdConnect: OpenIdConnect) {

    this._router = router;
    this._notificationService = notificationService;
    this._eventAggregator = eventAggregator;
    this._authenticationService = authenticationService;
    this._openIdConnect = openIdConnect;
  }

  public attached(): void {
    this.baseRoute = this.config.bpmnStudioClient.baseRoute;
    this.isLoggedInToProcessEngine = this._authenticationService.hasToken();

    this._subscriptions = [
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this.isLoggedInToProcessEngine = this._authenticationService.hasToken();
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this.isLoggedInToProcessEngine = this._authenticationService.hasToken();
      }),
    ];
  }

  public detached(): void {
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
  }

  public updateSettings(): void {
    this._authenticationService.logout();

    window.localStorage.setItem('processEngineRoute', this.config.processEngineRoute);

    oidcConfig.userManagerSettings.authority = this.config.openIdConnect.authority;

    // This dirty way to update the settings is the only way during runtime
    this._openIdConnect.configuration.userManagerSettings.authority = this.config.openIdConnect.authority;
    this._openIdConnect.userManager._settings._authority = this.config.openIdConnect.authority;
<<<<<<< HEAD
=======

    this._bpmnStudioClient.updateConfig(this.config);
>>>>>>> feature/migrate_bpmn_studio_to_new_stack

    this._notificationService.showNotification(NotificationType.SUCCESS, 'Successfully saved settings!');
    this._eventAggregator.publish(environment.events.configPanel.processEngineRouteChanged, this.baseRoute);
    this._router.navigateBack();
  }

  public cancelUpdate(): void {
    this._notificationService.showNotification(NotificationType.WARNING, 'Settings dismissed!');
    this._router.navigateBack();
  }

}
