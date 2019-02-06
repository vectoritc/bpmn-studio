import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {OpenIdConnect} from 'aurelia-open-id-connect';
import {Router} from 'aurelia-router';

import {User} from 'oidc-client';

import {AuthenticationStateEvent, IAuthenticationService, IIdentity, NotificationType} from '../../contracts/index';
import {oidcConfig} from '../../open-id-connect-configuration';
import {NotificationService} from './../notification/notification.service';

const UNAUTHORIZED_STATUS_CODE: number = 401;
const IDENTITY_SERVER_AVAILABLE_SUCCESS_STATUS_CODE: number = 200;

@inject(EventAggregator, 'NotificationService', OpenIdConnect, Router)
export class WebOidcAuthenticationService implements IAuthenticationService {

  private _eventAggregator: EventAggregator;
  private _openIdConnect: OpenIdConnect | any;
  private _notificationService: NotificationService;

  constructor(eventAggregator: EventAggregator,
              notificationService: NotificationService,
              openIdConnect: OpenIdConnect) {
    this._eventAggregator = eventAggregator;
    this._notificationService = notificationService;
    this._openIdConnect = openIdConnect;
  }

  public async isLoggedIn(authority: string): Promise<boolean> {
    const identity: IIdentity = await this.getIdentity(authority);

    // TODO: Get the userinfo from the authroity to determine if a user is logged in.
    return false;
  }

  public async login(): Promise<void> {

    const isIdentityServerReachable: boolean = await this._isIdentityServerReachable();

    if (!isIdentityServerReachable) {
      this._notificationService.showNotification(NotificationType.ERROR, 'IdentityServer is offline');
      return;
    }

    await this._openIdConnect.login();
    const identity: IIdentity = await this.getIdentity();
    this._eventAggregator.publish(AuthenticationStateEvent.LOGIN, identity);
  }

  }

  public async logout(): Promise<void> {

    if (!this.isLoggedIn) {
      return;
    }

    return await this._openIdConnect.logout();
  }

  public getAccessToken(): string | null {
    const userIsNotLoggedIn: boolean = this._user === undefined;

    if (userIsNotLoggedIn) {
      return this._getDummyAccessToken();
    }

    return this._user.access_token;
  }

  // TODO: The dummy token needs to be removed in the future!!
  // This dummy token serves as a temporary workaround to bypass login. This
  // enables us to work without depending on a full environment with
  // IdentityServer.
  private _getDummyAccessToken(): string {
    const dummyAccessTokenString: string = 'dummy_token';
    const base64EncodedString: string = btoa(dummyAccessTokenString);
    return base64EncodedString;
  }

  public async getIdentity(): Promise<IIdentity | null> {

    const accessToken: string = this.getAccessToken();

    if (!accessToken) {
      return null;
    }

    const request: Request = new Request(`${environment.openIdConnect.authority}/connect/userinfo`, {
      method: 'GET',
      mode: 'cors',
      referrer: 'no-referrer',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const response: Response = await fetch(request);

    if (response.status === UNAUTHORIZED_STATUS_CODE) {
      return null;
    }

    return response.json();
  }

  private async _isIdentityServerReachable(): Promise<boolean> {
    const request: Request = new Request(`${environment.openIdConnect.authority}/.well-known/openid-configuration`, {
      method: 'GET',
      mode: 'cors',
      referrer: 'no-referrer',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });

    let response: Response;

    try {

     response = await fetch(request);
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        return false;
      }
    }

    if (response.status === IDENTITY_SERVER_AVAILABLE_SUCCESS_STATUS_CODE) {
      return true;
    }

    return false;
  }
}
