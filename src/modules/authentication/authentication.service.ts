import {ITokenRepository} from '@process-engine/bpmn-studio_client';
import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {
  AuthenticationStateEvent,
  IAuthenticationRepository,
  IAuthenticationService,
  IIdentity,
  ILoginResult,
  ILogoutResult,
} from '../../contracts/index';

const LOCAL_STORAGE_TOKEN_KEY: string = 'process-engine-token';

@inject(EventAggregator, 'AuthenticationRepository', 'TokenRepository')
export class AuthenticationService {

  public tokenRepository: ITokenRepository;

  private _eventAggregator: EventAggregator;
  private _authenticationRepository: IAuthenticationRepository;

  constructor(eventAggregator: EventAggregator, authenticationRepository: IAuthenticationRepository, tokenRepository: ITokenRepository) {
    this._eventAggregator = eventAggregator;
    this._authenticationRepository = authenticationRepository;
    this.tokenRepository = tokenRepository;
  }

  public async initialize(): Promise<void> {
    const savedToken: string = window.localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    if (savedToken === undefined || savedToken === null || savedToken === '') {
      return;
    }
    // try to get the identity from the saved token
    let identity: IIdentity;
    try {
      identity = await this._authenticationRepository.getIdentity(savedToken);
    } catch (error) {
      // token is no longer valid, so we remove it from
      // the localstorage
      window.localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
      return;
    }
    this.tokenRepository.setToken(savedToken);
    this.tokenRepository.setIdentity(identity);
  }

  public getAccessToken(): string {
    return this.tokenRepository.getToken();
  }

  public getIdentity(): Promise<IIdentity> {
    return Promise.resolve(this.tokenRepository.getIdentity() as IIdentity);
  }

  public async login(username: string, password: string): Promise<IIdentity> {
    const result: ILoginResult = await this._authenticationRepository.login(username, password);
    this.tokenRepository.setToken(result.token);
    this.tokenRepository.setIdentity(result.identity);
    this._eventAggregator.publish(AuthenticationStateEvent.LOGIN, result.identity);
    window.localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, result.token);
    return result.identity;
  }

  public async logout(): Promise<void> {
    const result: ILogoutResult = await this._authenticationRepository.logout();
    this.tokenRepository.setToken(null);
    this.tokenRepository.setIdentity(null);
    this._eventAggregator.publish(AuthenticationStateEvent.LOGOUT);
    window.localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
  }

  public hasToken(): boolean {
    const token: string = this.tokenRepository.getToken();
    return token !== null && token !== undefined && token !== '';
  }
}
