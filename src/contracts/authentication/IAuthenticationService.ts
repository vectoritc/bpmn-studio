import {IIdentity} from '@essential-projects/iam_contracts';
import {ILoginResult} from './ILoginResult';

export interface IAuthenticationService {
  login(authority: string): Promise<ILoginResult>;
  logout(authority: string, identity: IIdentity): Promise<void>;
  isLoggedIn(authority: string): Promise<boolean>;
  getAccessToken(authority: string): Promise<string>;
}
