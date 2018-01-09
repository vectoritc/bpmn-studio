import {IIdentity} from './IIdentity';

export interface ILoginResult {
  identity: IIdentity;
  token: string;
}
