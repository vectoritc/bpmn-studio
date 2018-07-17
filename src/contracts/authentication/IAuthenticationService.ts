import {IIdentity} from './IIdentity';

export interface IAuthenticationService {
  // TODO: remove old implementations that still use username and password
  login(username?: string, password?: string): Promise<void>;
  logout(): Promise<void>;
  getAccessToken(): string;
  hasToken(): boolean;
  getIdentity(): Promise<IIdentity>;
}
