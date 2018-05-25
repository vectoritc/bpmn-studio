import {EventAggregator} from 'aurelia-event-aggregator';
import {bindable, computedFrom, inject} from 'aurelia-framework';
import {IAuthenticationService, IIdentity, NotificationType} from '../../contracts/index';
import {AuthenticationStateEvent} from './../../contracts/index';
import {NotificationService} from './../notification/notification.service';

@inject('AuthenticationService', EventAggregator, 'NotificationService')
export class UserLogin {

  private authenticationService: IAuthenticationService;
  private username: string;
  private password: string;
  private _eventAggregator: EventAggregator;
  private _notificationService: NotificationService;

  public dropdownIsOpen: boolean = false;

  constructor(authenticationService: IAuthenticationService, eventAggregator: EventAggregator, notificationService: NotificationService) {
    this.authenticationService = authenticationService;
    this._eventAggregator = eventAggregator;
    this._notificationService = notificationService;
  }

  public toggleDropdown(): void {
    this.dropdownIsOpen = !this.dropdownIsOpen;
  }

  public attached(): void {
    this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
      if (this.isLoggedIn) {
        this.logout();
      }
    });
  }

  public async login(): Promise<void> {
    try {
      await this.authenticationService.login(this.username, this.password);
      this.username = undefined;
      this.password = undefined;
      this.toggleDropdown();
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, error.message);
    }
  }

  public logout(): void {
    this.authenticationService.logout();
    this.toggleDropdown();
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
