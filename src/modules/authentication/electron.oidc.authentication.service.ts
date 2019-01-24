import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {AuthenticationStateEvent,
        IAuthenticationService,
        IIdentity,
        ISolutionEntry,
        ISolutionService,
        ITokenObject,
        NotificationType} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from '../notification/notification.service';

const UNAUTHORIZED_STATUS_CODE: number = 401;
const IDENTITY_SERVER_AVAILABLE_SUCCESS_STATUS_CODE: number = 200;

@inject(EventAggregator, 'NotificationService', Router, 'SolutionService')
export class ElectronOidcAuthenticationService implements IAuthenticationService {

  private _eventAggregator: EventAggregator;
  private _notificationService: NotificationService;
  private _router: Router;
  private _tokenObject: ITokenObject;
  private _solutionService: ISolutionService;

  constructor(eventAggregator: EventAggregator,
              notificationService: NotificationService,
              router: Router,
              solutionService: ISolutionService) {
    this._eventAggregator = eventAggregator;
    this._notificationService = notificationService;
    this._router = router;
    this._solutionService = solutionService;

    this._getPersistedTokenObject();

    const tokenObjectIsNotUndefined: boolean = this._tokenObject !== null;
    if (tokenObjectIsNotUndefined) {
      this.checkUserInfo();
    }
  }

  public isLoggedIn(): boolean {
    const userIsExisting: boolean = this._tokenObject !== undefined;

    return userIsExisting;
  }

  public async login(): Promise<void> {

    const identityServerIsNotReachable: boolean = await !this._isIdentityServerReachable();
    if (identityServerIsNotReachable) {
      this._notificationService.showNotification(NotificationType.ERROR, 'IdentityServer is offline');
      return;
    }

    const ipcRenderer: any = (window as any).nodeRequire('electron').ipcRenderer;

    ipcRenderer.on('oidc-login-reply', async(event: any, tokenObject: ITokenObject) => {
      this._tokenObject = tokenObject;
      const identity: IIdentity = await this.getIdentity();
      this._eventAggregator.publish(AuthenticationStateEvent.LOGIN, identity);

      const remoteSolutions: Array<ISolutionEntry> = this._solutionService.getRemoteSolutionEntries();

      remoteSolutions.forEach((solution: ISolutionEntry) => {
        solution.identity = {
          token: tokenObject.accessToken,
          userId: tokenObject.idToken,
        };
      });

      this._persistTokenObject();
    });

    const openIdConnectRoute: string = window.localStorage.getItem('openIdRoute');
    const openIdRouteIsSet: boolean = openIdConnectRoute !== null;

    const authorityUrl: string = openIdRouteIsSet
                              ? openIdConnectRoute
                              : environment.openIdConnect.defaultAuthority;

    ipcRenderer.send('oidc-login', authorityUrl);
  }

  public async logout(): Promise<void> {

    const ipcRenderer: any = (window as any).nodeRequire('electron').ipcRenderer;

    ipcRenderer.on('oidc-logout-reply', async(event: any, logoutWasSuccessful: boolean) => {
      if (logoutWasSuccessful) {
        this._eventAggregator.publish(AuthenticationStateEvent.LOGOUT);
        this._tokenObject = undefined;

        this._logoutUserFromAllSolutions();
      }
    });

    const openIdConnectRoute: string = window.localStorage.getItem('openIdRoute');
    const openIdRouteIsSet: boolean = openIdConnectRoute !== null;

    const authorityUrl: string = openIdRouteIsSet
                              ? openIdConnectRoute
                              : environment.openIdConnect.defaultAuthority;

    ipcRenderer.send('oidc-logout', this._tokenObject, authorityUrl);

  }

  public getAccessToken(): string | null {
    const userIsNotLoggedIn: boolean = this._tokenObject === undefined || this._tokenObject === null;

    if (userIsNotLoggedIn) {
      return this._getDummyAccessToken();
    }

    return this._tokenObject.accessToken;
  }

  public async getIdentity(): Promise<IIdentity | null> {

    const token: string = this.getAccessToken();

    const userInforequest: Request = new Request(`${environment.openIdConnect.authority}/connect/userinfo`, {
      method: 'GET',
      mode: 'cors',
      referrer: 'no-referrer',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const userInforesponse: Response = await fetch(userInforequest);
    if (userInforesponse.status === UNAUTHORIZED_STATUS_CODE) {
      return null;
    }

    return userInforesponse.json();
  }

  public async checkUserInfo(): Promise<void> {
    const token: string = this.getAccessToken();

    const userInforequest: Request = new Request(`${environment.openIdConnect.authority}/connect/userinfo`, {
      method: 'GET',
      mode: 'cors',
      referrer: 'no-referrer',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    try {
      const userInforesponse: Response = await fetch(userInforequest);

      if (userInforesponse.status === UNAUTHORIZED_STATUS_CODE) {
        this._tokenObject = undefined;

        this._logoutUserFromAllSolutions();
      }

    } catch (error) {
      this._notificationService.showNotification(NotificationType.WARNING, 'The identity server may be offline!');
      this._tokenObject = undefined;

      this._logoutUserFromAllSolutions();
    }

  }

  private async _isIdentityServerReachable(): Promise<boolean> {
    const configRequest: Request = new Request(`${environment.openIdConnect.authority}/.well-known/openid-configuration`, {
      method: 'GET',
      mode: 'cors',
      referrer: 'no-referrer',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });

    let configResponse: Response;

    try {

     configResponse = await fetch(configRequest);
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        return false;
      }
    }

    if (configResponse.status === IDENTITY_SERVER_AVAILABLE_SUCCESS_STATUS_CODE) {
      return true;
    }

    return false;
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

  private _persistTokenObject(): void {
    window.localStorage.setItem('tokenObject', JSON.stringify(this._tokenObject));
  }

  private _getPersistedTokenObject(): void {
    const tokenObjectString: string = window.localStorage.getItem('tokenObject');

    const tokenObject: ITokenObject = JSON.parse(tokenObjectString);

    this._tokenObject = tokenObject;
  }

  private _logoutUserFromAllSolutions(): void {

    const dummyAccesToken: string = this._getDummyAccessToken();

    const remoteSolutionsEntries: Array<ISolutionEntry> = this._solutionService.getRemoteSolutionEntries();

    remoteSolutionsEntries.forEach((solutionEntry: ISolutionEntry) => {
      solutionEntry.identity = {
        token: dummyAccesToken,
        userId: '',
      };
    });

    window.localStorage.removeItem('tokenObject');
  }
}