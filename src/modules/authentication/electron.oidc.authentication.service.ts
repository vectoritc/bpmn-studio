import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';

import {IIdentity} from '@essential-projects/iam_contracts';

import {AuthenticationStateEvent,
        IAuthenticationService,
        ILoginResult,
        ITokenObject,
        IUserIdentity,
        NotificationType} from '../../contracts/index';
import {NotificationService} from '../notification/notification.service';

const UNAUTHORIZED_STATUS_CODE: number = 401;
const IDENTITY_SERVER_AVAILABLE_SUCCESS_STATUS_CODE: number = 200;

@inject(EventAggregator, 'NotificationService')
export class ElectronOidcAuthenticationService implements IAuthenticationService {

  private _eventAggregator: EventAggregator;
  private _notificationService: NotificationService;

  constructor(eventAggregator: EventAggregator,
              notificationService: NotificationService) {
    this._eventAggregator = eventAggregator;
    this._notificationService = notificationService;
  }

  public async isLoggedIn(authority: string, identity: IIdentity): Promise<boolean> {

    let userIdentity: IUserIdentity;

    try {
      userIdentity = await this.getUserIdentity(authority, identity);
    } catch (error) {

      return false;
    }

    const userIdentityIsDefined: boolean = userIdentity !== undefined && userIdentity !== null;

    return userIdentityIsDefined;
  }

  public async login(authority: string): Promise<ILoginResult> {

    const identityServerIsNotReachable: boolean = !(await this._isAuthorityReachable(authority));

    if (identityServerIsNotReachable) {

      return;
    }

    const loginResultPromise: Promise<ILoginResult> = new Promise(async(resolve: Function, reject: Function): Promise<void> => {

      const ipcRenderer: any = (window as any).nodeRequire('electron').ipcRenderer;

      ipcRenderer.on('oidc-login-reply', async(event: any, tokenObject: ITokenObject) => {
        const iamIdentity: IIdentity = {
          token: tokenObject.accessToken,
          userId: tokenObject.idToken,
        };
        const identity: IUserIdentity = await this.getUserIdentity(authority, iamIdentity);

        const loginResult: ILoginResult = {
          identity: identity,
          accessToken: tokenObject.accessToken,
          idToken: tokenObject.idToken,
        };

        this._eventAggregator.publish(AuthenticationStateEvent.LOGIN);

        ipcRenderer.removeAllListeners('oidc-login-reply');

        resolve(loginResult);
      });

      ipcRenderer.send('oidc-login', authority);
    });

    return loginResultPromise;
  }

  public async logout(authority: string, identity: IIdentity): Promise<void> {

    const ipcRenderer: any = (window as any).nodeRequire('electron').ipcRenderer;

    ipcRenderer.on('oidc-logout-reply', async(event: any, logoutWasSuccessful: boolean) => {
      if (logoutWasSuccessful) {
        this._eventAggregator.publish(AuthenticationStateEvent.LOGOUT);
      }
    });

    ipcRenderer.send('oidc-logout', identity, authority);
  }

  public async getUserIdentity(authority: string, identity: IIdentity): Promise<IUserIdentity | null> {

    const userInfoRequest: Request = new Request(`${authority}connect/userinfo`, {
      method: 'GET',
      mode: 'cors',
      referrer: 'no-referrer',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${identity.token}`,
      },
    });

    const userInfoResponse: Response = await fetch(userInfoRequest);
    if (userInfoResponse.status === UNAUTHORIZED_STATUS_CODE) {
      return null;
    }

    return userInfoResponse.json();
  }

  private async _isAuthorityReachable(authority: string): Promise<boolean> {
    const configRequest: Request = new Request(`${authority}.well-known/openid-configuration`, {
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
        this._notificationService.showNotification(NotificationType.ERROR, 'IdentityServer is offline.');

        return false;
      }

    }

    if (configResponse.status === IDENTITY_SERVER_AVAILABLE_SUCCESS_STATUS_CODE) {
      return true;
    }

    return false;
  }
}
