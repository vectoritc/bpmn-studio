import {IDiagram, ISolution} from '@process-engine/solutionexplorer.contracts';

export interface IDiagramCreationService {

  createNewDiagram(solutionBaseUri: string, diagrams: Array<IDiagram>, withName: string): IDiagram;

}
