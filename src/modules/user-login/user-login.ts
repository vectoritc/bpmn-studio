import {bindable, computedFrom, inject} from 'aurelia-framework';
import {IAuthenticationService, IIdentity} from '../../contracts/index';
import {IAuthenticationService, IIdentity, NotificationType} from '../../contracts/index';
import {NotificationService} from './../notification/notification.service';

@inject('AuthenticationService')
export class UserLogin {

  private authenticationService: IAuthenticationService;
  private username: string;
  private password: string;
  private _notificationService: NotificationService;

  constructor(authenticationService: IAuthenticationService) {
    this.authenticationService = authenticationService;
    this._notificationService = notificationService;
  }

  }

  public async login(): Promise<void> {
    try {
      await this.authenticationService.login(this.username, this.password);
      this.username = null;
      this.password = null;
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, error.message);
    }
  }

  public logout(): void {
    this.authenticationService.logout();
  }

  @computedFrom('authenticationService.tokenRepository.token')
  public get isLoggedIn(): boolean {
    return this.authenticationService.hasToken();
  }

  @computedFrom('isLoggedIn')
  public get identity(): IIdentity {
    return this.authenticationService.getIdentity();
  }
}
