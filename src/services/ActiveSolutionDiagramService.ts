import {IDiagram} from '@process-engine/solutionexplorer.contracts';
import {IActiveSolutionAndDiagramService, ISolutionEntry} from '../contracts';

export class ActiveSolutionAndDiagramService implements IActiveSolutionAndDiagramService {
  private _activeSolution: ISolutionEntry;
  private _activeDiagram: IDiagram;

  public getActiveSolution(): ISolutionEntry {
    return this._activeSolution;
  }

  public getActiveDiagram(): IDiagram {
    return this._activeDiagram;
  }

  public setActiveSolutionAndDiagram(solution: ISolutionEntry, diagram: IDiagram): void {
    this._activeSolution = solution;
    this._activeDiagram = diagram;
  }
}
