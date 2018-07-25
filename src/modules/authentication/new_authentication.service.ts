import {EventAggregator} from 'aurelia-event-aggregator';
import { inject } from 'aurelia-framework';
import { OpenIdConnect } from 'aurelia-open-id-connect';
import { User } from 'oidc-client';
import { SigninResponse } from './open-id/open-id-signin-response';

import {AuthenticationStateEvent, IAuthenticationService, IIdentity} from '../../contracts/index';
import environment from './../../environment';
import {oidcConfig} from './../../open-id-connect-configuration';

const UNAUTHORIZED_STATUS_CODE: number = 401;
const LOGOUT_SUCCESS_STATUS_CODE: number = 200;

@inject(EventAggregator, OpenIdConnect)
export class NewAuthenticationService implements IAuthenticationService {

  private _eventAggregator: EventAggregator;
  private _openIdConnect: OpenIdConnect;
  private _user: User;

  constructor(eventAggregator: EventAggregator, openIdConnect: OpenIdConnect) {
    this._eventAggregator = eventAggregator;
    this._openIdConnect = openIdConnect;
    this.initialize();
  }

  public async initialize(): Promise<void> {
    this._user = await this._openIdConnect.getUser();
  }

  public async login(): Promise<void> {
    await this._openIdConnect.login();
    const identity: IIdentity = await this.getIdentity();
    this._eventAggregator.publish(AuthenticationStateEvent.LOGIN, identity);
  }

  public async loginViaDeepLink(urlFragment: string): Promise<void> {
    const user: User = new User(new SigninResponse(urlFragment) as Oidc.SigninResponse);
    this._user = user;
    const identity: IIdentity = await this.getIdentity();
    this._eventAggregator.publish(AuthenticationStateEvent.LOGIN, identity);
  }

  public async logout(): Promise<void> {

    const isRunningInElectron: boolean = !!(<any> window).nodeRequire;

    if (!isRunningInElectron) {
      return await this._openIdConnect.logout();
    }

    const idToken: string = this._user.id_token;
    const logoutRedirectUri: string = oidcConfig.userManagerSettings.post_logout_redirect_uri;
    const queryParams: Array<Array<string>> = [
      ['id_token_hint', idToken],
      ['post_logout_redirect_uri', logoutRedirectUri],
    ];

    const endSessionUrl: URL = new URL(`${environment.openIdConnect.authority}/connect/endsession`);
    endSessionUrl.search = new URLSearchParams(queryParams).toString();

    const request: RequestInit = {
      method: 'GET',
      mode: 'cors',
      referrer: 'client',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    };
    try {
      const response: Response = await fetch(endSessionUrl.toString(), request);
      if (response.status !== LOGOUT_SUCCESS_STATUS_CODE) {
        throw new Error('Logout not successful');
      }
      window.open(response.url, '_blank');
    } catch (error) {
      throw new Error('Logout not successful');
    }
  }

  public getAccessToken(): string {
    if (!this._user) {
      return null;
    }
    return this._user.access_token;
  }

  public hasToken(): boolean {
    const hasToken: boolean =
      this._user !== undefined
      && this._user !== null
      && !!this._user.id_token;

    return hasToken;
  }

  public async getIdentity(): Promise<IIdentity> {

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
}
