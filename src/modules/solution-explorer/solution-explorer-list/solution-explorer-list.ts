import {IDiagram, ISolution} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';
import {computedFrom, inject} from 'aurelia-framework';
import {IAuthenticationService, IDiagramValidationService, IIdentity} from '../../../contracts';
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
}

interface UriToViewModelMap {
  [key: string]: SolutionExplorerSolution;
}

@inject('SolutionExplorerFactoryService', 'AuthenticationService', 'DiagramValidationService')
export class SolutionExplorerList {

  private _solutionExplorerFactoryService: SolutionExplorerFactoryService;
  private _authenticationService: IAuthenticationService;
  // Contains all opened solutions.
  private _openedSolutions: Array<ISolutionEntry> = [];
  // Keep a seperate map of all viewmodels for the solutions entries.
  // The uri maps to the viewmodel.
  public solutionEntryViewModels: UriToViewModelMap = {};

  // Reference on the service used to open single diagrams.
  // This service is also put inside the map.
  private _singleDiagramService: SingleDiagramsSolutionExplorerService;

  constructor(
    solutionExplorerFactoryService: SolutionExplorerFactoryService,
    authenticationService: IAuthenticationService,
    diagramValidationService: IDiagramValidationService,
  ) {
    this._solutionExplorerFactoryService = solutionExplorerFactoryService;
    this._authenticationService = authenticationService;

    // Add entry for single file service.
    solutionExplorerFactoryService.newFileSystemSolutionExplorer()
      .then((service: ISolutionExplorerService): void => {
        const uriOfSingleDiagramService: string = 'Single Diagrams';
        const nameOfSingleDiagramService: string = 'Single Diagrams';

        this._singleDiagramService = new SingleDiagramsSolutionExplorerService(
          diagramValidationService,
          service,
          uriOfSingleDiagramService,
          nameOfSingleDiagramService,
        );

        this._addSolutionEntry(uriOfSingleDiagramService, this._singleDiagramService, true);
      });

    // Allows us to debug the solution explorer list.
    (window as any).solutionList = this;
  }

  /**
   * Reopen all currently opened solutions to reload the identity
   * used to open the solution.
   */
  public async refreshSolutionsOnIdentityChange(): Promise<void> {
    const openPromises: Array<Promise<void>> = this._openedSolutions
      .map((entry: ISolutionEntry): Promise<void> => {
        return entry.service.openSolution(entry.uri, this._createIdentityForSolutionExplorer());
      });

    await Promise.all(openPromises);

    return this.refreshSolutions();
  }

  public async refreshSolutions(): Promise<void> {
    const refreshPromises: Array<Promise<void>> = Object.values(this.solutionEntryViewModels)
      .filter((viewModel: SolutionExplorerSolution): boolean => {
        const viewModelExists: boolean = viewModel !== undefined && viewModel !== null;
        return viewModelExists;
      })
      .map((viewModel: SolutionExplorerSolution): Promise<void> => {
        return viewModel.updateSolution();
      });

    await Promise.all(refreshPromises);
  }

  public async openSingleDiagram(uri: string): Promise<IDiagram> {
    const identity: IIdentity = this._createIdentityForSolutionExplorer();
    return this._singleDiagramService.openSingleDiagram(uri, identity);
  }

  public async openSolution(uri: string, insertAtBeginning: boolean = false): Promise<void> {
    const uriIsRemote: boolean = uri.startsWith('http');

    let solutionExplorer: ISolutionExplorerService;
    if (uriIsRemote) {
      solutionExplorer = await this._solutionExplorerFactoryService.newManagementApiSolutionExplorer();
    } else {
      solutionExplorer = await this._solutionExplorerFactoryService.newFileSystemSolutionExplorer();
    }

    const identity: IIdentity = this._createIdentityForSolutionExplorer();
    await solutionExplorer.openSolution(uri, identity);

    const newOpenedSpluton: ISolution = await solutionExplorer.loadSolution();
    const solutionURI: string = newOpenedSpluton.uri;

    const arrayAlreadyContainedURI: boolean = this._getIndexOfSolution(solutionURI) >= 0;

    if (arrayAlreadyContainedURI) {
      throw new Error('Solution is already opened.');
    }

    this._addSolutionEntry(uri, solutionExplorer, insertAtBeginning);
  }

  public async closeSolution(uri: string): Promise<void> {
    const indexOfSolutionToBeRemoved: number = this._getIndexOfSolution(uri);

    const uriNotFound: boolean = indexOfSolutionToBeRemoved < 0;
    if (uriNotFound) {
      return;
    }

    this._openedSolutions.splice(indexOfSolutionToBeRemoved, 1);
  }

  public async createDiagram(entry: ISolutionEntry): Promise<void> {
    const viewModelOfEntry: SolutionExplorerSolution = this.solutionEntryViewModels[entry.uri];
    return viewModelOfEntry.startCreationOfNewDiagram();
  }

  // Give aurelia a hint on what objects to observe.
  // If we dont do this, it falls back to active pooling which is slow.
  // `_singleDiagramService._openedDiagrams.length` observed because
  // aurelia cannot see the business rules happening in this._shouldDisplaySolution().
  @computedFrom('_openedSolutions.length', '_singleDiagramService._openedDiagrams.length')
  public get openedSolutions(): Array<ISolutionEntry> {
    const filteredEntries: Array<ISolutionEntry> = this._openedSolutions
      .filter(this._shouldDisplaySolution);

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

  private _addSolutionEntry(uri: string, service: ISolutionExplorerService, insertAtBeginning: boolean): void {
    const isSingleDiagramService: boolean = this._isSingleDiagramService(service);

    const entry: ISolutionEntry = {
      uri,
      service,
      fontAwesomeIconClass: undefined,
      canCloseSolution: undefined,
      canCreateNewDiagramsInSolution: undefined,
      isSingleDiagramService,
    };

    entry.fontAwesomeIconClass = this.getFontAwesomeIconForSolution(entry);
    entry.canCloseSolution = this._canCloseSolution(entry);
    entry.canCreateNewDiagramsInSolution = this._canCreateNewDiagramsInSolution(entry);

    if (insertAtBeginning) {
      this._openedSolutions.splice(1, 0, entry);
    } else {
      this._openedSolutions.push(entry);
    }
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
