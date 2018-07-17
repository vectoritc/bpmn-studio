import {IIdentity, ITokenRepository} from '@process-engine/bpmn-studio_client';

export class TokenRepository implements ITokenRepository {

  public token: string;

  private _identity: IIdentity;

  public getToken(): string {
    return this.token;
  }

  public setToken(token: string): void {
    this.token = token;
  }

  public getIdentity(): IIdentity {
    return this._identity;
  }

  public setIdentity(identity: IIdentity): void {
    this._identity = identity;
  }
}
