import {ISolutionEntry, ISolutionService} from '../contracts';

export class SolutionService implements ISolutionService {
  private _allSolutionEntries: Array<ISolutionEntry> = [];

  public addSolutionEntry(solutionEntry: ISolutionEntry): void {
    this._allSolutionEntries.push(solutionEntry);
  }

  public removeSolutionEntry(solutionEntry: ISolutionEntry): void {
    this._allSolutionEntries.splice(this._allSolutionEntries.indexOf(solutionEntry));
  }

  public getSolutionEntryForUri(uri: string): ISolutionEntry {
    const solutionEntry: ISolutionEntry = this._allSolutionEntries.find((entry: ISolutionEntry) => {
      return entry.uri === uri;
    });

    return solutionEntry;
  }
}
