import {IDiagram} from '@process-engine/solutionexplorer.contracts';
import {ISolutionEntry, ISolutionService} from '../contracts';

export class SolutionService implements ISolutionService {
  private _allSolutionEntries: Array<ISolutionEntry> = [];
  private _activeSolution: ISolutionEntry;

  public addSolutionEntry(solutionEntry: ISolutionEntry): void {
    this._allSolutionEntries.push(solutionEntry);
  }

  public closeSolutionEntry(solutionEntry: ISolutionEntry): void {
    this._allSolutionEntries.splice(this._allSolutionEntries.indexOf(solutionEntry));
  }

  public getActiveSolutionEntry(): ISolutionEntry {

    return this._activeSolution;
  }

  public getSolutionEntryForUri(uri: string): ISolutionEntry {
    const solutionEntry: ISolutionEntry = this._allSolutionEntries.find((entry: ISolutionEntry) => {
      return entry.uri === uri;
    });

    return solutionEntry;
  }

  public setActiveSolution(solution: ISolutionEntry): void {
    this._activeSolution = solution;
  }
}
