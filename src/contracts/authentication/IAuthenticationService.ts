import {IIdentity} from './IIdentity';

export interface IAuthenticationService {
  login(authority: string): Promise<void>;
  logout(authority: string): Promise<void>;
  isLoggedIn(authority: string): Promise<boolean>;
  getAccessToken(authority: string): Promise<string>;
  getIdentity(authority: string): Promise<IIdentity>;
}
