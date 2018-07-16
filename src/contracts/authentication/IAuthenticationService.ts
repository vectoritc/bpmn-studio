import {IIdentity} from './IIdentity';

export interface IAuthenticationService {
  // TODO: remove old implementations that still use username and password
  login(username?: string, password?: string): Promise<IIdentity>;
  logout(): Promise<void>;
  getIdentityToken(): string;
  getAccessToken(): string;
  hasToken(): boolean;
  getIdentity(): IIdentity;
}
