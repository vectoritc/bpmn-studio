import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {OpenIdConnect} from 'aurelia-open-id-connect';
import {User} from 'oidc-client';
import {SigninResponse} from './open-id/open-id-signin-response';

import { Router } from 'aurelia-router';
import {AuthenticationStateEvent, IAuthenticationService, IIdentity} from '../../contracts/index';
import environment from '../../environment';
import {oidcConfig} from '../../open-id-connect-configuration';

const UNAUTHORIZED_STATUS_CODE: number = 401;
const LOGOUT_SUCCESS_STATUS_CODE: number = 200;

@inject(EventAggregator, OpenIdConnect, Router)
export class AuthenticationService implements IAuthenticationService {

  private _eventAggregator: EventAggregator;
  private _openIdConnect: OpenIdConnect;
  private _router: Router;
  private _user: User;
  private _logoutWindow: Window = null;

  constructor(eventAggregator: EventAggregator, openIdConnect: OpenIdConnect, router: Router) {
    this._eventAggregator = eventAggregator;
    this._openIdConnect = openIdConnect;
    this._router = router;

    this._initialize();
  }

  private async _initialize(): Promise<void> {
    this._user = await this._openIdConnect.getUser();
  }

  public isLoggedIn(): boolean {
    const userIsExisting: boolean = this._user !== undefined;

    return userIsExisting;
  }

  public async login(): Promise<void> {
    await this._openIdConnect.login();
    const identity: IIdentity = await this.getIdentity();
    this._eventAggregator.publish(AuthenticationStateEvent.LOGIN, identity);
  }

  public async loginViaDeepLink(urlFragment: string): Promise<void> {
    const signinResponse: Oidc.SigninResponse = new SigninResponse(urlFragment) as Oidc.SigninResponse;
    const user: User = new User(signinResponse);
    this._user = user;
    const identity: IIdentity = await this.getIdentity();

    this._eventAggregator.publish(AuthenticationStateEvent.LOGIN, identity);
  }

  public finishLogout(): void {
    // This will be called in the electron version where we perform the logout
    // manually.
    if (this._logoutWindow !== null) {
      this._logoutWindow.close();
      this._logoutWindow = null;
    }
    this._user = null;
    this._eventAggregator.publish(AuthenticationStateEvent.LOGOUT);
    this._router.navigate('/');
  }

  public async logout(): Promise<void> {

    if (!this.isLoggedIn) {
      return;
    }

    const isRunningInElectron: boolean = Boolean((window as any).nodeRequire);

    if (!isRunningInElectron) {
      // If we're in the browser, we need to let the oidc plugin handle the
      // logout so that push state works correctly
      return await this._openIdConnect.logout();
    }

    // The following part is a manual implementation of the implicit flow logout
    // specifically for the Identity Server endpoints.
    // It is not tested with other providers yet and will definitely get
    // refactored once we switch to hybrid flow.

    const idToken: string = this._user.id_token;
    const logoutRedirectUri: string = oidcConfig.userManagerSettings.post_logout_redirect_uri;
    const queryParams: Array<Array<string>> = [
      ['id_token_hint', idToken],
      ['post_logout_redirect_uri', logoutRedirectUri],
    ];

    const endSessionUrl: URL = new URL(`${environment.openIdConnect.authority}/connect/endsession`);
    endSessionUrl.search = new URLSearchParams(queryParams as any).toString();

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

      // If Identity Server replies with success, is has already invalidated the
      // access_token. Now we can show the success dialog of the Identity Server
      // in a new window and finish the logout process once the "return to
      // application" link is clicked.
      this._logoutWindow = window.open(response.url, '_blank');

    } catch (error) {
      throw new Error('Logout not successful');
    }
  }

  public getAccessToken(): string | null {
    if (!this._user) {
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
}
