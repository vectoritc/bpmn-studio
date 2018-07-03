import {computedFrom, inject} from 'aurelia-framework';
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

  public user: User | null = null;

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
