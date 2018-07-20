import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {OpenIdConnect} from 'aurelia-open-id-connect';
import {User} from 'oidc-client';

import {AuthenticationStateEvent, IAuthenticationService, IIdentity} from '../../contracts/index';
import environment from './../../environment';

const UNAUTHORIZED_STATUS_CODE: number = 401;

@inject(EventAggregator, OpenIdConnect)
export class NewAuthenticationService implements IAuthenticationService {

  private _eventAggregator: EventAggregator;
  private _openIdConnect: OpenIdConnect;
  private _user: User;

  constructor(eventAggregator: EventAggregator, openIdConnect: OpenIdConnect) {
    this._eventAggregator = eventAggregator;
    this._openIdConnect = openIdConnect;
    this._initialize();
  }

  private async _initialize(): Promise<void> {
    this._user = await this._openIdConnect.getUser();
  }

  public async login(): Promise<void> {
    await this._openIdConnect.login();
    const identity: IIdentity = await this.getIdentity();
    this._eventAggregator.publish(AuthenticationStateEvent.LOGIN, identity);
  }

  public logout(): Promise<void> {

    return new Promise((resolve: Function, reject: Function): void => {

      this._openIdConnect.addOrRemoveHandler('addUserUnloaded', () => {

        this._eventAggregator.publish(AuthenticationStateEvent.LOGOUT);
        resolve();
      });

      try {
        this._openIdConnect.logout();
      } catch (error) {
        reject(error);
      }

    });
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
