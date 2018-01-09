import {ILoginResult} from './ILoginResult';
import {ILogoutResult} from './ILogoutResult';

export interface IAuthenticationRepository {
  login(username: string, password: string): Promise<ILoginResult>;
  logout(): Promise<ILogoutResult>;
  getIdentity(token: string): Promise<any>;
}
