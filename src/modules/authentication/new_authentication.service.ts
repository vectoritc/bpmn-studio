import { inject } from 'aurelia-framework';
import { OpenIdConnect } from 'aurelia-open-id-connect';
import { User } from 'oidc-client';

import {IAuthenticationService, IIdentity} from '../../contracts/index';

@inject(OpenIdConnect, 'TokenRepository')
export class NewAuthenticationService implements IAuthenticationService {

  private _openIdConnect: OpenIdConnect;
  private _tokenRepository: ITokenRepository;
  private _user: User;

  constructor(openIdConnect: OpenIdConnect, tokenRepository: ITokenRepository) {
    this._openIdConnect = openIdConnect;

    this._openIdConnect.observeUser((user: User) => {
      this._user = user;
      console.log('user loaded', user);
      if (!user) {
        return;
      }
      // this._tokenRepository.setToken(user.id_token);
      // this._tokenRepository.setIdentity(user);

    });

    this.initialize();
    this._tokenRepository = tokenRepository;
  }

  public async initialize(): Promise<void> {
    this._user = await this._openIdConnect.getUser();

    // this._tokenRepository.setToken(this._user.id_token);
    // this._tokenRepository.setIdentity(this._user);
  }

  public login(): Promise<IIdentity> {

    return new Promise((resolve: Function, reject: Function): void => {

      this._openIdConnect.addOrRemoveHandler('addUserLoaded', async() => {
        const user: User = await this._openIdConnect.getUser();
        this._user = user;
        console.log('user loaded', user);
        // this._tokenRepository.setToken(user.id_token);
        // this._tokenRepository.setIdentity(user);
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
    return this._user.access_token;
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
