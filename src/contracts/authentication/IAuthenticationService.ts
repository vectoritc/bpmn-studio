import {IIdentity} from './IIdentity';

export interface IAuthenticationService {
  login(): Promise<IIdentity>;
  logout(): Promise<void>;
  getToken(): string;
  hasToken(): boolean;
  getIdentity(): IIdentity;
}
