import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';
import {inject} from 'aurelia-framework';
import {IAuthenticationService, IIdentity} from '../../../contracts';
import {SolutionExplorerFactoryService} from '../../solution-explorer-services/SolutionExplorerFactoryService';

@inject('SolutionExplorerFactoryService', 'AuthenticationService')
export class SolutionExplorerList {

  private _solutionExplorerFactoryService: SolutionExplorerFactoryService;
  private _authenticationService: IAuthenticationService;
  private _openedSolutions: Array<ISolutionExplorerService> = [];

  constructor(solutionExplorerFactoryService: SolutionExplorerFactoryService, authenticationService: IAuthenticationService) {
    this._solutionExplorerFactoryService = solutionExplorerFactoryService;
    this._authenticationService = authenticationService;

    this.openSolution('http://localhost:8000').catch(console.log);
  }

  public get openedSolutions(): Array<ISolutionExplorerService> {
    return this._openedSolutions;
  }

  public async openSolution(uri: string): Promise<void> {
    const solutionExplorer: ISolutionExplorerService = await this._solutionExplorerFactoryService.newManagementApiSolutionExplorer();

    await solutionExplorer.openSolution(uri, this._createIdentityForSolutionExplorer());
    await solutionExplorer.loadSolution();

    this._openedSolutions.push(solutionExplorer);
  }

  private _createIdentityForSolutionExplorer(): IIdentity {
    const identity: IIdentity = {} as IIdentity;

    const solutionExplorerAccessToken: {accessToken: string} = {
      accessToken: this._authenticationService.getAccessToken(),
    };

    Object.assign(identity, solutionExplorerAccessToken);

    return identity;
  }

}
