import {IIdentity} from './IIdentity';

export interface IAuthenticationService {
  readonly isLoggedIn: boolean;
  login(): Promise<void>;
  logout(): Promise<void>;
  getAccessToken(): string;
  getIdentity(): Promise<IIdentity>;
}
