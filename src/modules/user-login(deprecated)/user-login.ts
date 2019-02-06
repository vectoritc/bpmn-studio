import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, bindingMode, computedFrom, inject} from 'aurelia-framework';

import {AuthenticationStateEvent, IAuthenticationService, IIdentity, NotificationType} from '../../contracts/index';
import {NotificationService} from './../notification/notification.service';

@inject('AuthenticationService', EventAggregator, 'NotificationService')
export class UserLogin {
  private _authenticationService: IAuthenticationService;
  private _eventAggregator: EventAggregator;
  private _notificationService: NotificationService;
  private _subscriptions: Array<Subscription>;

  @bindable({ defaultBindingMode: bindingMode.oneWay })
  public identity: IIdentity | null = null;

  @computedFrom('identity')
  public get isLoggedIn(): boolean {
    return this.identity !== null && this.identity !== undefined;
  }

  @computedFrom('identity')
  public get username(): string {
    if (!this.identity) {
      return '';
    }

    if (!this.identity.given_name || !this.identity.family_name) {
      return this.identity.name;
    }

    const fullName: string = `${this.identity.given_name} ${this.identity.family_name}`;

    return fullName;
  }

  constructor(authenticationService: IAuthenticationService,
              eventAggregator: EventAggregator,
              notificationService: NotificationService) {

    this._authenticationService = authenticationService;
    this._eventAggregator = eventAggregator;
    this._notificationService = notificationService;
  }

  public async attached(): Promise<void> {
    this._subscriptions = [
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this.identity = null;
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, (identity: IIdentity) => {
        this.identity = identity;
      }),
    ];
    // this.identity = await this._authenticationService.getIdentity();
  }

  public detached(): void {
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
  }

  public async login(): Promise<void> {
    try {
      // await this._authenticationService.login();
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, error.message);
    }
  }

  public logout(): Promise<void> {
    // return this._authenticationService.logout();
    return;
  }
}
