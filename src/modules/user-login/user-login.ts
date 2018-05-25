import {bindable, computedFrom, inject} from 'aurelia-framework';
import {IAuthenticationService, IIdentity} from '../../contracts/index';

@inject('AuthenticationService')
export class UserLogin {

  private authenticationService: IAuthenticationService;
  private username: string;
  private password: string;
  private loginError: string;

  constructor(authenticationService: IAuthenticationService) {
    this.authenticationService = authenticationService;
  }

  }

  public async login(): Promise<void> {
    try {
      await this.authenticationService.login(this.username, this.password);
      this.username = null;
      this.password = null;
      this.loginError = null;
    } catch (error) {
      this.loginError = error.message;
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
