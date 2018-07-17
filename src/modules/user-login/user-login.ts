import {bindable, bindingMode, computedFrom, inject} from 'aurelia-framework';
import { OpenIdConnect } from 'aurelia-open-id-connect';
import { User } from 'oidc-client';

import {IAuthenticationService, IIdentity, NotificationType} from '../../contracts/index';
import {NotificationService} from './../notification/notification.service';

@inject('NewAuthenticationService', 'NotificationService', OpenIdConnect)
export class UserLogin {

  private _authenticationService: IAuthenticationService;
  private _notificationService: NotificationService;
  private _openIdConnect: OpenIdConnect;

  @computedFrom('user')
  public get isLoggedIn(): boolean {
    return this.user !== null && this.user !== undefined;
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

  @bindable({ defaultBindingMode: bindingMode.oneWay })
  public user: User | null = null;
  @bindable({ defaultBindingMode: bindingMode.oneWay })
  public identity: IIdentity = null;

  constructor(authenticationService: IAuthenticationService,
              notificationService: NotificationService,
              openIdConnect: OpenIdConnect) {
    this._authenticationService = authenticationService;
    this._notificationService = notificationService;
    this._openIdConnect = openIdConnect;
  }

  public async attached(): Promise<void> {
    this._openIdConnect.addOrRemoveHandler('addUserUnloaded', () => {
      this.user = null;
    });

    this._openIdConnect.addOrRemoveHandler('addUserLoaded', async() => {
      this.user = await this._openIdConnect.getUser();
    });
    this._openIdConnect.observeUser((user: User) => this.user = user);
    this.user = await this._openIdConnect.getUser();
  }

  public async userChanged(): Promise<void> {
    this.identity = await this._authenticationService.getIdentity();
  }

  public async login(): Promise<void> {
    try {
      await this._authenticationService.login();
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, error.message);
    }
  }

  public logout(): void {
    this._authenticationService.logout();
  }
}
