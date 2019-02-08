import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';

import {IIdentity} from '@essential-projects/iam_contracts';

import {AuthenticationStateEvent,
        IAuthenticationService,
        ILoginResult,
        ISolutionService,
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

  public async isLoggedIn(authority: string): Promise<boolean> {

    return false;
  }

  public async login(authority: string): Promise<ILoginResult> {

    const loginResultPromise: Promise<ILoginResult> = new Promise(async(resolve: Function, reject: Function): Promise<void> => {

      const identityServerIsNotReachable: boolean = await !this._isAuthorityReachable(authority);
      if (identityServerIsNotReachable) {
        this._notificationService.showNotification(NotificationType.ERROR, 'IdentityServer is offline');
        return;
      }

      const ipcRenderer: any = (window as any).nodeRequire('electron').ipcRenderer;

      ipcRenderer.on('oidc-login-reply', async(event: any, tokenObject: ITokenObject) => {
        const identity: IUserIdentity = await this.getUserIdentity(authority);

        const loginResult: ILoginResult = {
          identity: identity,
          token: tokenObject.accessToken,
        };

        console.log('login result', loginResult);
        this._eventAggregator.publish(AuthenticationStateEvent.LOGIN);

        resolve(loginResult);
      });

      console.log('send login', authority);
      ipcRenderer.send('oidc-login', authority);
    });

    return loginResultPromise;
  }

  public async logout(authority: string): Promise<void> {

    const ipcRenderer: any = (window as any).nodeRequire('electron').ipcRenderer;

    ipcRenderer.on('oidc-logout-reply', async(event: any, logoutWasSuccessful: boolean) => {
      if (logoutWasSuccessful) {
        this._eventAggregator.publish(AuthenticationStateEvent.LOGOUT);

      }
    });

    ipcRenderer.send('oidc-logout', this._tokenObject, authority);
  }

  public async getUserIdentity(authority: string, accessToken: string): Promise<IUserIdentity | null> {

    const userInforequest: Request = new Request(`${authority}connect/userinfo`, {
      method: 'GET',
      mode: 'cors',
      referrer: 'no-referrer',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userInforesponse: Response = await fetch(userInforequest);
    if (userInforesponse.status === UNAUTHORIZED_STATUS_CODE) {
      return null;
    }

    return userInforesponse.json();
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
  private getDummyAccessToken(): string {
    const dummyAccessTokenString: string = 'dummy_token';
    const base64EncodedString: string = btoa(dummyAccessTokenString);
    return base64EncodedString;
  }
}
