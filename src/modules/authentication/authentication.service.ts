import {ITokenRepository} from '@process-engine/bpmn-studio_client';
import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {
  AuthenticationStateEvent,
  IAuthenticationRepository,
  IAuthenticationService,
  IIdentity,
  ILoginResult,
} from '../../contracts/index';

const LOCAL_STORAGE_TOKEN_KEY: string = 'process-engine-token';

@inject(EventAggregator, 'AuthenticationRepository', 'TokenRepository')
export class AuthenticationService implements IAuthenticationService {

  private _eventAggregator: EventAggregator;
  private _authenticationRepository: IAuthenticationRepository;
  private _tokenRepository: ITokenRepository;

  constructor(eventAggregator: EventAggregator, authenticationRepository: IAuthenticationRepository, tokenRepository: ITokenRepository) {
    this._eventAggregator = eventAggregator;
    this._authenticationRepository = authenticationRepository;
    this._tokenRepository = tokenRepository;
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
    this._tokenRepository.setToken(savedToken);
    this._tokenRepository.setIdentity(identity);
  }

  public getToken(): string {
    return this._tokenRepository.getToken();
  }

  public getIdentity(): IIdentity {
    return this._tokenRepository.getIdentity();
  }

  public async login(username: string, password: string): Promise<IIdentity> {
    const result: ILoginResult = await this._authenticationRepository.login(username, password);
    this._tokenRepository.setToken(result.token);
    this._tokenRepository.setIdentity(result.identity);
    this._eventAggregator.publish(AuthenticationStateEvent.LOGIN, result.identity);
    window.localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, result.token);
    return result.identity;
  }

  public async logout(): Promise<void> {
    const result: any = await this._authenticationRepository.logout();
    this._tokenRepository.setToken(null);
    this._tokenRepository.setIdentity(null);
    this._eventAggregator.publish(AuthenticationStateEvent.LOGOUT);
    window.localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    return result;
  }

  public hasToken(): boolean {
    const token: string = this._tokenRepository.getToken();
    return token !== null && token !== undefined && token !== '';
  }
}
