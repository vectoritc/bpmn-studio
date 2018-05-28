import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, computedFrom, inject} from 'aurelia-framework';
import {IAuthenticationService, IIdentity, NotificationType} from '../../contracts/index';
import {AuthenticationStateEvent} from './../../contracts/index';
import {NotificationService} from './../notification/notification.service';

@inject('AuthenticationService', EventAggregator, 'NotificationService')
export class UserLogin {

  private _authenticationService: IAuthenticationService;
  private _eventAggregator: EventAggregator;
  private _notificationService: NotificationService;
  private _subscriptions: Array<Subscription>;

  public username: string;
  public password: string;
  public userLogin: HTMLElement;

  constructor(authenticationService: IAuthenticationService, eventAggregator: EventAggregator, notificationService: NotificationService) {
    this._authenticationService = authenticationService;
    this._eventAggregator = eventAggregator;
    this._notificationService = notificationService;
  }

  public closeDropdown(): void {
    this.userLogin.className = 'user-login';
  }

  public attached(): void {
    document.addEventListener('click', this.isDropdownClicked);
    this._subscriptions = [
      this._eventAggregator.subscribe('user-login:triggerLogout', () => {
        if (this.isLoggedIn) {
          this.logout();
        }
      }),
    ];
  }

  public detached(): void {
    document.removeEventListener('click', this.isDropdownClicked);
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
  }

  public isDropdownClicked: EventListenerOrEventListenerObject =  (event: MouseEvent): void => {
    const dropdown: any = document.querySelector('#dropdown');
    if (dropdown.contains(event.target)) {
      this.userLogin.className = 'user-login open';
    }
  }

  public async login(): Promise<void> {
    try {
      await this._authenticationService.login(this.username, this.password);
      this.username = undefined;
      this.password = undefined;
      this.closeDropdown();
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, error.message);
    }
  }

  public logout(): void {
    this._authenticationService.logout();
    this.closeDropdown();
  }

  @computedFrom('_authenticationService.tokenRepository.token')
  public get isLoggedIn(): boolean {
    return this._authenticationService.hasToken();
  }

  @computedFrom('isLoggedIn')
  public get identity(): IIdentity {
    return this._authenticationService.getIdentity();
  }
}
