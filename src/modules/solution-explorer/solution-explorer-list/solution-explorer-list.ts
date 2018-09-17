import {ISolution} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';
import {computedFrom, inject} from 'aurelia-framework';
import {IAuthenticationService, IIdentity} from '../../../contracts';
import {SingleDiagramsSolutionExplorerService} from '../../solution-explorer-services/SingleDiagramsSolutionExplorerService';
import {SolutionExplorerFactoryService} from '../../solution-explorer-services/SolutionExplorerFactoryService';
import {SolutionExplorerSolution} from '../solution-explorer-solution/solution-explorer-solution';

interface ISolutionEntry {
  service: ISolutionExplorerService;
  viewModel?: SolutionExplorerSolution;
  uri: string;
}

@inject('SolutionExplorerFactoryService', 'AuthenticationService')
export class SolutionExplorerList {

  private _solutionExplorerFactoryService: SolutionExplorerFactoryService;
  private _authenticationService: IAuthenticationService;
  // This maps the solutions uri to their service.
  private _openedSolutions: Map<string, ISolutionEntry> = new Map();

  constructor(solutionExplorerFactoryService: SolutionExplorerFactoryService, authenticationService: IAuthenticationService) {
    this._solutionExplorerFactoryService = solutionExplorerFactoryService;
    this._authenticationService = authenticationService;

    // TODO(ph): Use configured url + refresh when url changes.
    this.openSolution('http://localhost:8000').catch(console.log);
    this.openSolution('http://127.0.0.1:8000').catch(console.log);

    // Add entry single file service
    this._openedSolutions.set('Single Diagrams', {
      service: new SingleDiagramsSolutionExplorerService(undefined),
      uri: 'lol',
    });
  }

  public async refreshSolutions(): Promise<void> {
    const valuesAsArray: Array<ISolutionEntry> = Array.from(this._openedSolutions.values());

    const refreshPromises: Array<Promise<void>> = valuesAsArray
      .map((entry: ISolutionEntry): Promise<void> => {
        return entry.viewModel.updateSolution();
      });

    await Promise.all(refreshPromises);
  }

  public async openSolution(uri: string): Promise<void> {
    const uriIsRemote: boolean = uri.startsWith('http');

    let solutionExplorer: ISolutionExplorerService;
    if (uriIsRemote) {
      solutionExplorer = await this._solutionExplorerFactoryService.newManagementApiSolutionExplorer();
    } else {
      solutionExplorer = await this._solutionExplorerFactoryService.newFileSystemSolutionExplorer();
    }

    await solutionExplorer.openSolution(uri, this._createIdentityForSolutionExplorer());

    const newOpenedSpluton: ISolution = await solutionExplorer.loadSolution();
    const solutionURI: string = newOpenedSpluton.uri;

    const mapAlreadyContainedURI: boolean = this._openedSolutions.has(solutionURI);

    if (mapAlreadyContainedURI) {
      throw new Error('URI already added ');
    }

    const solutionEntry: ISolutionEntry = {
      service: solutionExplorer,
      uri: uri,
    };

    this._openedSolutions.set(solutionURI, solutionEntry);
  }

  public async closeSolution(uri: string): Promise<void> {
    this._openedSolutions.delete(uri);
  }

  @computedFrom('_openedSolutions.size')
  public get openedSolutions(): Array<ISolutionEntry> {
    const valuesAsArray: Array<ISolutionEntry> = Array.from(this._openedSolutions.values());

    const filteredEntries: Array<ISolutionEntry> = valuesAsArray.filter(this.shouldDisplaySolution);

    return filteredEntries;
  }

  public shouldDisplaySolution(entry: ISolutionEntry): boolean {
    const service: ISolutionExplorerService = entry.service;

    const isSingleDiagramService: boolean = (service as any).getOpenedDiagrams !== undefined;
    if (isSingleDiagramService) {
      const singleDiagramService: SingleDiagramsSolutionExplorerService = service as SingleDiagramsSolutionExplorerService;

      const someDiagramsAreOpened: boolean = singleDiagramService.getOpenedDiagrams().length > 0;
      return someDiagramsAreOpened;
    }

    return true;
  }

  public getFontAwesomeIconForSolution(urlOfSolution: string): string {
    const diagramIsOpenedFromRemote: boolean = urlOfSolution.startsWith('http');
    if (diagramIsOpenedFromRemote) {
      return 'fa-database';
    }
    return 'fa-folder';
  }

  public canCreateNewDiagramsInSolution(entry: ISolutionEntry): boolean {
    const solutionIsOpenedFromRemote: boolean = entry.uri.startsWith('http');
    return !solutionIsOpenedFromRemote;
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
