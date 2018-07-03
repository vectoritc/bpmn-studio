import { autoinject } from 'aurelia-framework';
import { OpenIdConnect } from 'aurelia-open-id-connect';
import { User } from 'oidc-client';

import {IAuthenticationService, IIdentity} from '../../contracts/index';

@autoinject()
export class NewAuthenticationService implements IAuthenticationService {

  private _openIdConnect: OpenIdConnect;
  private _user: User;

  constructor(openIdConnect: OpenIdConnect) {
    this._openIdConnect = openIdConnect;
  }

  public login(): Promise<IIdentity> {

    return new Promise((resolve: Function, reject: Function): void => {

      this._openIdConnect.addOrRemoveHandler('addUserLoaded', async() => {
        const user: User = await this._openIdConnect.getUser();
        this._user = user;
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

  public getToken(): string {
    return this._user.id_token;
  }
  public hasToken(): boolean {
    const hasToken: boolean =
      this._user !== undefined
      && this._user !== null
      && !!this._user.id_token;

    return hasToken;
  }
  public getIdentity(): IIdentity {
    return undefined;
  }

}
