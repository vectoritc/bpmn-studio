import {computedFrom, inject} from 'aurelia-framework';
import {IAuthenticationService, IIdentity, NotificationType} from '../../contracts/index';
import {NotificationService} from './../notification/notification.service';

@inject('AuthenticationService', 'NotificationService')
export class UserLogin {

  public username: string;
  public password: string;

    /**
   * We are using the direct reference of a container element to open or
   * close the dropdown.
   *
   * This needs to be refactored.
   *
   * https://github.com/process-engine/bpmn-studio/issues/455
   */

  public userLogin: HTMLElement;
  public dropdown: HTMLElement;
  public logoutButton: HTMLButtonElement;

  private _authenticationService: IAuthenticationService;
  private _notificationService: NotificationService;

  constructor(authenticationService: IAuthenticationService, notificationService: NotificationService) {
    this._authenticationService = authenticationService;
    this._notificationService = notificationService;
  }

  public attached(): void {
    document.addEventListener('click', this.dropdownClickListener);
  }

  public detached(): void {
    document.removeEventListener('click', this.dropdownClickListener);
  }

  public dropdownClickListener: EventListenerOrEventListenerObject =  (event: MouseEvent): void => {
    const eventTarget: Node = event.target as Node;
    if (this.dropdown.contains(eventTarget) && event.target !== this.logoutButton) {
      this.userLogin.className = 'user-login open';
    }
  }

  public async login(): Promise<void> {
    try {
      await this._authenticationService.login(this.username, this.password);
      this.username = undefined;
      this.password = undefined;
      this._closeDropdown();
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, error.message);
    }
  }

  public logout(): void {
    this._authenticationService.logout();
    this._closeDropdown();
  }

  @computedFrom('_authenticationService.tokenRepository.token')
  public get isLoggedIn(): boolean {
    return this._authenticationService.hasToken();
  }

  @computedFrom('isLoggedIn')
  public get identity(): IIdentity {
    return this._authenticationService.getIdentity();
  }

  private _closeDropdown(): void {
    this.userLogin.className = 'user-login';
  }
}
