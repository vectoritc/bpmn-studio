import {ISolution} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';
import {computedFrom, inject} from 'aurelia-framework';
import {IAuthenticationService, IIdentity} from '../../../contracts';
import {SingleDiagramsSolutionExplorerService} from '../../solution-explorer-services/SingleDiagramsSolutionExplorerService';
import {SolutionExplorerFactoryService} from '../../solution-explorer-services/SolutionExplorerFactoryService';
import {SolutionExplorerSolution} from '../solution-explorer-solution/solution-explorer-solution';

interface ISolutionEntry {
  service: ISolutionExplorerService;
  uri: string;
  fontAwesomeIconClass: string;
  isSingleDiagramService: boolean;
  canCloseSolution: boolean;
  canCreateNewDiagramsInSolution: boolean;
  visible: boolean;
}

@inject('SolutionExplorerFactoryService', 'AuthenticationService')
export class SolutionExplorerList {

  private _solutionExplorerFactoryService: SolutionExplorerFactoryService;
  private _authenticationService: IAuthenticationService;
  // TODO
  private _openedSolutions: Array<ISolutionEntry> = [];
  // Keep a seperate array of all viewmodels. This array is used to update
  // the solutions.
  public solutionEntryViewModels: Array<SolutionExplorerSolution> = [];

  // Reference on the service used to open single diagrams.
  // This service is also put inside the map.
  private _singleDiagramService: SingleDiagramsSolutionExplorerService;

  constructor(solutionExplorerFactoryService: SolutionExplorerFactoryService, authenticationService: IAuthenticationService) {
    this._solutionExplorerFactoryService = solutionExplorerFactoryService;
    this._authenticationService = authenticationService;

    // TODO(ph): Use configured url + refresh when url changes.
    this.openSolution('http://localhost:8000').catch(console.log);
    this.openSolution('http://127.0.0.1:8000').catch(console.log);

    // TODO(ph): Extract
    // Add entry single file service
    solutionExplorerFactoryService.newFileSystemSolutionExplorer().then((service: ISolutionExplorerService): void => {
      const uriOfSingleDiagramService: string = 'Single Diagrams';
      const nameOfSingleDiagramService: string = 'Single Diagrams';

      this._singleDiagramService = new SingleDiagramsSolutionExplorerService(service, uriOfSingleDiagramService, nameOfSingleDiagramService);

      this._addSolutionEntry(uriOfSingleDiagramService, this._singleDiagramService);
    });
  }

  public async refreshSolutions(): Promise<void> {
    const refreshPromises: Array<Promise<void>> = this.solutionEntryViewModels
      .filter((viewModel: SolutionExplorerSolution): boolean => {
        const viewModelExists: boolean = viewModel !== undefined && viewModel !== null;
        return viewModelExists;
      })
      .map((viewModel: SolutionExplorerSolution): Promise<void> => {
        return viewModel.updateSolution();
      });

    await Promise.all(refreshPromises);
  }

  public async openSingleDiagram(uri: string): Promise<void> {
    // TODO (ph): Cleanup!
    await this._singleDiagramService.openSingleDiagram(uri, this._createIdentityForSolutionExplorer());
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

    const arrayAlreadyContainedURI: boolean = this._getIndexOfSolution(solutionURI) >= 0;

    if (arrayAlreadyContainedURI) {
      throw new Error('URI already added ');
    }

    this._addSolutionEntry(uri, solutionExplorer);
  }

  public async closeSolution(uri: string): Promise<void> {
    const indexOfSolutionToBeRemoved: number = this._getIndexOfSolution(uri);
    this._openedSolutions.splice(indexOfSolutionToBeRemoved, 1);
  }

  public async createDiagram(viewModelOfSolution: SolutionExplorerSolution): Promise<void> {
    return viewModelOfSolution.startCreationOfNewDiagram();
  }

  // Give aurelia a hint on what objects to observe.
  // If we dont do this, it falls back to active pooling which is slow.
  // `_singleDiagramService._openedDiagrams.length` observed because
  // aurelia cannot see the business rules happening in this._shouldDisplaySolution().
  @computedFrom('_openedSolutions.length', '_singleDiagramService._openedDiagrams.length')
  public get openedSolutions(): Array<ISolutionEntry> {
    const filteredEntries: Array<ISolutionEntry> = this._openedSolutions.filter(this._shouldDisplaySolution);

    return filteredEntries;
  }

  private getFontAwesomeIconForSolution(entry: ISolutionEntry): string {
    const diagramIsOpenedFromRemote: boolean = entry.uri.startsWith('http');
    if (diagramIsOpenedFromRemote) {
      return 'fa-database';
    }
    const solutionIsSingleDiagrams: boolean = entry.service === this._singleDiagramService;
    if (solutionIsSingleDiagrams) {
      return 'fa-copy';
    }
    return 'fa-folder';
  }

  private _canCreateNewDiagramsInSolution(entry: ISolutionEntry): boolean {
    const solutionIsNotOpenedFromRemote: boolean = !entry.uri.startsWith('http');
    const solutionIsNotSingleDiagrams: boolean = entry.service !== this._singleDiagramService;
    return solutionIsNotOpenedFromRemote && solutionIsNotSingleDiagrams;
  }

  private _canCloseSolution(entry: ISolutionEntry): boolean {
    const solutionIsNotSingleDiagrams: boolean = !this._isSingleDiagramService(entry.service);
    return solutionIsNotSingleDiagrams;
  }

  private _isSingleDiagramService(service: ISolutionExplorerService): boolean {
    return service === this._singleDiagramService;
  }

  /**
   * Wherever to display that solution entry. Some entries are not display if
   * empty. This method capsules this logic.
   */
  private _shouldDisplaySolution(entry: ISolutionEntry): boolean {
    const service: ISolutionExplorerService = entry.service;

    const isSingleDiagramService: boolean = (service as any).getOpenedDiagrams !== undefined;
    if (isSingleDiagramService) {
      const singleDiagramService: SingleDiagramsSolutionExplorerService = service as SingleDiagramsSolutionExplorerService;

      const someDiagramsAreOpened: boolean = singleDiagramService.getOpenedDiagrams().length > 0;

      return someDiagramsAreOpened;
    }

    return true;
  }

  private _getIndexOfSolution(uri: string): number {
    const indexOfSolutionWithURI: number = this._openedSolutions.findIndex((element: ISolutionEntry): boolean => {
      return element.uri === uri;
    });

    return indexOfSolutionWithURI;
  }

  private _addSolutionEntry(uri: string, service: ISolutionExplorerService): void {
    const isSingleDiagramService: boolean = this._isSingleDiagramService(service);

    const entry: ISolutionEntry = {
      uri,
      service,
      fontAwesomeIconClass: undefined,
      canCloseSolution: undefined,
      canCreateNewDiagramsInSolution: undefined,
      isSingleDiagramService,
      visible: true,
    };

    entry.fontAwesomeIconClass = this.getFontAwesomeIconForSolution(entry);
    entry.canCloseSolution = this._canCloseSolution(entry);
    entry.canCreateNewDiagramsInSolution = this._canCreateNewDiagramsInSolution(entry);

    this._openedSolutions.push(entry);
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
