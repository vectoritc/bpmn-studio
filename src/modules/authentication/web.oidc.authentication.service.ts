import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {OpenIdConnect} from 'aurelia-open-id-connect';
import {Router} from 'aurelia-router';

import {IIdentity} from '@essential-projects/iam_contracts';
import {User} from 'oidc-client';

import {AuthenticationStateEvent, IAuthenticationService, ILoginResult, IUserIdentity, NotificationType} from '../../contracts/index';
import {oidcConfig} from '../../open-id-connect-configuration';
import {NotificationService} from './../notification/notification.service';

const UNAUTHORIZED_STATUS_CODE: number = 401;
const IDENTITY_SERVER_AVAILABLE_SUCCESS_STATUS_CODE: number = 200;

@inject(EventAggregator, 'NotificationService', OpenIdConnect, Router)
export class WebOidcAuthenticationService implements IAuthenticationService {

  private _eventAggregator: EventAggregator;
  /**
   * We have to use any here since it is the only way to access the private members
   * of this. We need the access them when changing the authority while the application
   * is running.
   */
  private _openIdConnect: OpenIdConnect | any;
  private _notificationService: NotificationService;

  constructor(eventAggregator: EventAggregator,
              notificationService: NotificationService,
              openIdConnect: OpenIdConnect) {
    this._eventAggregator = eventAggregator;
    this._notificationService = notificationService;
    this._openIdConnect = openIdConnect;
  }

  public async isLoggedIn(authority: string, identity: IIdentity): Promise<boolean> {
    const userIdentity: IUserIdentity = await this._getUserIdentity(authority);

    const userIsNotAuthorized: boolean = userIdentity === null;
    return userIsNotAuthorized
          ? false
          : true;
  }

  public async login(authority: string): Promise<ILoginResult> {

    const isAuthorityReachable: boolean = await this._isAuthorityReachable(authority);

    if (!isAuthorityReachable) {
      this._notificationService.showNotification(NotificationType.ERROR, 'Authority seems to be offline');
      return;
    }

    await this._setAuthority(authority);
    await this._openIdConnect.login();
    window.localStorage.setItem('openIdRoute', authority);

    this._eventAggregator.publish(AuthenticationStateEvent.LOGIN);

    const loginResult: ILoginResult = {
      identity: await this._getUserIdentity(authority),
      accessToken: await this._getAccessToken(authority),
      // The idToken is provided by the oidc service when making requests and therefore not set here.
      idToken: '',
    };

    return loginResult;
  }

  public async logout(authority: string, identity: IIdentity): Promise<void> {

    if (!this.isLoggedIn) {
      return;
    }

    await this._setAuthority(authority);
    await this._openIdConnect.logout();

  }

  private async _getUserIdentity(authority: string): Promise<IUserIdentity | null> {
    const accessToken: string = await this._getAccessToken(authority);
    const accessTokenIsDummyToken: boolean = accessToken === this._getDummyAccessToken();

    if (accessTokenIsDummyToken) {
      return null;
    }

    const request: Request = new Request(`${authority}connect/userinfo`, {
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

  private async _isAuthorityReachable(authority: string): Promise<boolean> {
    const request: Request = new Request(`${authority}.well-known/openid-configuration`, {
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

  private _setAuthority(authority: string): void {
    oidcConfig.userManagerSettings.authority = authority;

    // This dirty way to update the settings is the only way during runtime
    this._openIdConnect.configuration.userManagerSettings.authority = authority;
    this._openIdConnect.userManager._settings._authority = authority;
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

  private async _getAccessToken(authority: string): Promise<string | null> {
    this._setAuthority(authority);
    const user: User = await this._openIdConnect.getUser();

    const userIsNotLoggedIn: boolean = user === undefined || user === null;

    return userIsNotLoggedIn
          ? this._getDummyAccessToken()
          : user.access_token;
  }
}
