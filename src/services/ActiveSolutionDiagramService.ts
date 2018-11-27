import {IDiagram} from '@process-engine/solutionexplorer.contracts';
import {IActiveSolutionAndDiagramService, ISolutionEntry} from '../contracts';

export class ActiveSolutionAndDiagramService implements IActiveSolutionAndDiagramService {
  private _allSolutionEntries: Array<ISolutionEntry> = [];
  private _activeSolution: ISolutionEntry;
  private _activeDiagram: IDiagram;

  public addSolutionEntry(solutionEntry: ISolutionEntry): void {
    this._allSolutionEntries.push(solutionEntry);
  }

  public closeSolutionEntry(solutionEntry: ISolutionEntry): void {
    this._allSolutionEntries.splice(this._allSolutionEntries.indexOf(solutionEntry));
  }

  public getActiveSolutionEntry(): ISolutionEntry {

    return this._activeSolution;
  }

  public getActiveDiagram(): IDiagram {

    return this._activeDiagram;
  }

  public getSolutionEntryForUri(uri: string): ISolutionEntry {
    const solutionEntry: ISolutionEntry = this._allSolutionEntries.find((entry: ISolutionEntry) => {
      return entry.uri === uri;
    });

    return solutionEntry;
  }

  public setActiveSolutionAndDiagram(solution: ISolutionEntry, diagram: IDiagram): void {
    this._activeSolution = solution;
    this._activeDiagram = diagram;
  }
}
