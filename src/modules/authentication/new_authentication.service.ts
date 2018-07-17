import { inject } from 'aurelia-framework';
import { OpenIdConnect } from 'aurelia-open-id-connect';
import { User } from 'oidc-client';

import { access } from 'fs';
import {IAuthenticationService, IIdentity} from '../../contracts/index';
import environment from './../../environment';

@inject(OpenIdConnect)
export class NewAuthenticationService implements IAuthenticationService {

  private _openIdConnect: OpenIdConnect;
  private _user: User;

  constructor(openIdConnect: OpenIdConnect) {
    this._openIdConnect = openIdConnect;

    this._openIdConnect.observeUser((user: User) => {
      this._user = user;
      console.log('user loaded', user);
      if (!user) {
        return;
      }
    });

    this.initialize();
  }

  public async initialize(): Promise<void> {
    this._user = await this._openIdConnect.getUser();
  }

  public login(): Promise<IIdentity> {

    return new Promise((resolve: Function, reject: Function): void => {

      this._openIdConnect.addOrRemoveHandler('addUserLoaded', async() => {
        const user: User = await this._openIdConnect.getUser();
        this._user = user;
        console.log('user loaded', user);
        resolve(user);
      });

      try {
        this._openIdConnect.login();
      } catch (error) {
        reject(error);
      }
    });
  }

  public logout(): Promise<void> {

    return new Promise((resolve: Function, reject: Function): void => {

      this._openIdConnect.addOrRemoveHandler('addUserUnloaded', () => {
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

    return response.json();
  }

}
