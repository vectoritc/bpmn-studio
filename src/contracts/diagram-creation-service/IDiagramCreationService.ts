import {IDiagram, ISolution} from '@process-engine/solutionexplorer.contracts';

export interface IDiagramCreationService {

  createNewDiagram(insideSolution: ISolution, withName: string): IDiagram;

}
