import {inject} from 'aurelia-framework';

import {IDiagram, ISolution} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';

import {IIdentity} from '../../../../../contracts';

@inject('SolutionExplorerServiceManagementApi')
export class GeneralRepository {
  private _solutionExplorerManagementService: ISolutionExplorerService;
  private _identity: IIdentity;

  constructor(solutionExplorerService: ISolutionExplorerService) {
    this._solutionExplorerManagementService = solutionExplorerService;
  }

  public async getAllDiagrams(): Promise<Array<IDiagram>> {
    const solution: ISolution = await this._solutionExplorerManagementService.loadSolution();
    const diagrams: Array<IDiagram> = solution.diagrams;

    return diagrams;
  }

  public updateDiagram(diagram: IDiagram): Promise<IDiagram> {
    return this._solutionExplorerManagementService.saveSingleDiagram(diagram, this._identity);
  }
}
