import {inject} from 'aurelia-framework';

import {ISolutionEntry, ISolutionService} from '../contracts';

import {SolutionExplorerServiceFactory} from '../modules/solution-explorer-services/SolutionExplorerServiceFactory';

@inject('SolutionExplorerServiceFactory')
export class SolutionService implements ISolutionService {
  private _allSolutionEntries: Array<ISolutionEntry> = [];
  private _serviceFactory: SolutionExplorerServiceFactory;
  private _persistedEntries: Array<ISolutionEntry> = [];
  private _internalProcessEngineRoute: string;

  constructor(serviceFactory: SolutionExplorerServiceFactory) {
    this._serviceFactory = serviceFactory;

    const openedSolutions: Array<ISolutionEntry> = this._getSolutionFromLocalStorage();
    const openedSolutionsAreNotSet: boolean = openedSolutions === null;
    if (openedSolutionsAreNotSet) {
      return;
    }

    openedSolutions.forEach(async(solution: ISolutionEntry) => {
      const solutionIsRemote: boolean = solution.uri.startsWith('http');

      solution.service = solutionIsRemote
        ? await this._serviceFactory.newManagementApiSolutionExplorer()
        : await this._serviceFactory.newFileSystemSolutionExplorer();
    });

    this._persistedEntries = openedSolutions;
    this._allSolutionEntries = this._allSolutionEntries.concat(openedSolutions);

    this._internalProcessEngineRoute = window.localStorage.getItem('InternalProcessEngineRoute');
  }

  public addSolutionEntry(solutionEntry: ISolutionEntry): void {

    const solutionWithSameUri: ISolutionEntry = this._allSolutionEntries.find((entry: ISolutionEntry) => {
      const entryHasSameUri: boolean = entry.uri === solutionEntry.uri;

      return entryHasSameUri;
    });
    const solutionIsAlreadyOpenend: boolean = solutionWithSameUri !== undefined;
    if (solutionIsAlreadyOpenend) {
      this.removeSolutionEntryByUri(solutionWithSameUri.uri);
    }

    this._allSolutionEntries.push(solutionEntry);
    this._persistSolutionsInLocalStorage();
  }

  public getPersistedEntries(): Array<ISolutionEntry> {
    return this._persistedEntries;
  }

  public getSolutionEntryForUri(uri: string): ISolutionEntry {
    const solutionEntry: ISolutionEntry = this._allSolutionEntries.find((entry: ISolutionEntry) => {
      const entryUriIsSearchedUri: boolean = entry.uri === uri;

      return entryUriIsSearchedUri;
    });

    return solutionEntry;
  }

  public getRemoteSolutionEntries(): Array<ISolutionEntry> {
    const remoteEntries: Array<ISolutionEntry> = this._allSolutionEntries.filter((entry: ISolutionEntry) => {
      return entry.uri.startsWith('http');
    });

    return remoteEntries;
  }

  public removeSolutionEntryByUri(uri: string): void {
    const solutionToRemove: ISolutionEntry = this._allSolutionEntries.find((entry: ISolutionEntry) => {
      return entry.uri === uri;
    });

    const solutionNotFound: boolean = solutionToRemove === undefined;
    if (solutionNotFound) {
      return;
    }

    this._allSolutionEntries.splice(this._allSolutionEntries.indexOf(solutionToRemove), 1);
    this._persistSolutionsInLocalStorage();
  }

  private _persistSolutionsInLocalStorage(): void {
    /**
     * Right now the single diagrams don't get persisted.
     */
    const entriesToPersist: Array<ISolutionEntry> = this._allSolutionEntries.filter((entry: ISolutionEntry) => {
      const entryIsNotSingleDiagramSolution: boolean = entry.uri !== 'Single Diagrams';

      return entryIsNotSingleDiagramSolution;
    });

    window.localStorage.setItem('openedSolutions', JSON.stringify(entriesToPersist));
    this._persistedEntries = entriesToPersist;
  }

  private _getSolutionFromLocalStorage(): Array<ISolutionEntry> {
    const openedSolutions: Array<ISolutionEntry> = JSON.parse(window.localStorage.getItem('openedSolutions'));

    return openedSolutions;
  }

}
