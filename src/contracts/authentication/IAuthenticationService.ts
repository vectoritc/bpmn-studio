import {IIdentity} from './IIdentity';

export interface IAuthenticationService {
  login(username: string, password: string): Promise<IIdentity>;
  logout(): Promise<void>;
  getToken(): string;
  hasToken(): boolean;
  getIdentity(): IIdentity;
}
