import {BpmnStudioClient} from '@process-engine/bpmn-studio_client';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, inject} from 'aurelia-framework';
import {OpenIdConnect} from 'aurelia-open-id-connect';
import {Router} from 'aurelia-router';
import environment from '../../environment';
import {IAuthenticationService} from './../../contracts/authentication/IAuthenticationService';
import {AuthenticationStateEvent, NotificationType} from './../../contracts/index';
import {oidcConfig} from './../../open-id-connect-configuration';
import {NotificationService} from './../notification/notification.service';

@inject(Router, 'BpmnStudioClient', 'NotificationService', EventAggregator, 'AuthenticationService', OpenIdConnect)
export class ConfigPanel {

  private _router: Router;
  private _bpmnStudioClient: BpmnStudioClient;
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
              bpmnStudioClient: BpmnStudioClient,
              notificationService: NotificationService,
              eventAggregator: EventAggregator,
              authenticationService: IAuthenticationService,
              openIdConnect: OpenIdConnect) {
    this._router = router;
    this._bpmnStudioClient = bpmnStudioClient;
    this.config.processEngineRoute = environment.bpmnStudioClient.baseRoute;
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
    environment.bpmnStudioClient.baseRoute = this.config.processEngineRoute;
    window.localStorage.setItem('processEngineRoute', this.config.processEngineRoute);
    environment.processengine.routes.processes = `${this.config.processEngineRoute}/datastore/ProcessDef`;
    environment.processengine.routes.iam = `${this.config.processEngineRoute}/iam`;
    environment.processengine.routes.messageBus = `${this.config.processEngineRoute}/mb`;
    environment.processengine.routes.processInstances = `${this.config.processEngineRoute}/datastore/Process`;
    environment.processengine.routes.startProcess = `${this.config.processEngineRoute}/processengine/start`;
    environment.processengine.routes.userTasks =  `${this.config.processEngineRoute}/datastore/UserTask`;
    environment.processengine.routes.importBPMN = `${this.config.processEngineRoute}/processengine/create_bpmn_from_xml`;

  oidcConfig.userManagerSettings.authority = this.config.openIdConnect.authority;

  // This dirty way to update the settings is the only way during runtime
  this._openIdConnect.configuration.userManagerSettings.authority = this.config.openIdConnect.authority;
  this._openIdConnect.userManager._settings._authority = this.config.openIdConnect.authority;
    
  this._bpmnStudioClient.updateConfig(this.config);

    this._notificationService.showNotification(NotificationType.SUCCESS, 'Successfully saved settings!');
    this._eventAggregator.publish('statusbar:processEngineRoute:update', this.baseRoute);
    this._router.navigateBack();
  }

  public cancelUpdate(): void {
    this._notificationService.showNotification(NotificationType.WARNING, 'Settings dismissed!');
    this._router.navigateBack();
  }

}
