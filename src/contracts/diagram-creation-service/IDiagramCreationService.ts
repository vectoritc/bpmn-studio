import {ISolution} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';

export interface IDiagramCreationService {

  createNewDiagram(solutionExplorerService: ISolutionExplorerService, insideSolution: ISolution, withName: string): Promise<void>;

}
