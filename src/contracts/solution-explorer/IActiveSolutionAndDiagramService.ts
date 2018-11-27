import {IDiagram} from '@process-engine/solutionexplorer.contracts';

import {ISolutionEntry} from './ISolutionEntry';

export interface IActiveSolutionAndDiagramService {
  getActiveSolution(): ISolutionEntry;
  getActiveDiagram(): IDiagram;
  setActiveSolutionAndDiagram(solution: ISolutionEntry, diagram: IDiagram): void;
}
