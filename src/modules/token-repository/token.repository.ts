import {IIdentity, ITokenRepository} from '@process-engine/bpmn-studio_client';

export class TokenRepository implements ITokenRepository {

  private _identity: IIdentity;
  private _token: string;

  public getToken(): string {
    return this._token;
  }

  public setToken(token: string): void {
    this._token = token;
  }

  public getIdentity(): IIdentity {
    return this._identity;
  }

  public setIdentity(identity: IIdentity): void {
    this._identity = identity;
  }
}
