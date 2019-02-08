import {ILoginResult} from './ILoginResult';

export interface IAuthenticationService {
  login(authority: string): Promise<ILoginResult>;
  logout(authority: string): Promise<void>;
  isLoggedIn(authority: string): Promise<boolean>;
  getAccessToken(authority: string): Promise<string>;
}
