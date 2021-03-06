import {IDiagram, ISolution} from '@process-engine/solutionexplorer.contracts';

export interface IDiagramCreationService {

  createNewDiagram(solutionBaseUri: string, withName: string): IDiagram;

}
