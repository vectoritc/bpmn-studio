import {ISolutionEntry, ISolutionService} from '../contracts';

export class SolutionService implements ISolutionService {
  private _allSolutionEntries: Array<ISolutionEntry> = [];

  public addSolutionEntry(solutionEntry: ISolutionEntry): void {
    this._allSolutionEntries.push(solutionEntry);
  }

  public removeSolutionEntry(solutionEntry: ISolutionEntry): void {
    this._allSolutionEntries.splice(this._allSolutionEntries.indexOf(solutionEntry));
    this._allSolutionEntries.splice(this._allSolutionEntries.indexOf(solutionEntry), 1);
    this._persistSolutionsInLocalStorage();
  }
  }

  public getSolutionEntryForUri(uri: string): ISolutionEntry {
    const solutionEntry: ISolutionEntry = this._allSolutionEntries.find((entry: ISolutionEntry) => {
      return entry.uri === uri;
    });

    return solutionEntry;
  }

  private _persistSolutionsInLocalStorage(): void {
    /**
     * Right now the single diagrams solution don't get persisted.
     */
    const entriesToPersist: Array<ISolutionEntry> = this._allSolutionEntries.filter((entry: ISolutionEntry) => {
      return entry.uri !== 'Single Diagrams';
    });

    window.localStorage.setItem('openedSolutions', JSON.stringify(entriesToPersist));
  }

  private _getSolutionFromLocalStorage(): Array<ISolutionEntry> {
    const openedSolutions: Array<ISolutionEntry> = JSON.parse(window.localStorage.getItem('openedSolutions'));

    return openedSolutions;
  }

  private _removeCurrentRemoteSolution(): void {
    const remoteSolution: ISolutionEntry = this._allSolutionEntries.find((entry: ISolutionEntry) => {
      return entry.uri.startsWith('http');
    });

    this.removeSolutionEntry(remoteSolution);
  }

}
