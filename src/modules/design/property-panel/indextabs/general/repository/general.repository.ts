import {inject} from 'aurelia-framework';

import {IIdentity} from '@essential-projects/iam_contracts';
import {IDiagram, ISolution} from '@process-engine/solutionexplorer.contracts';

import {IActiveSolutionAndDiagramService, ISolutionEntry} from '../../../../../../contracts';

@inject('ActiveSolutionAndDiagramService')
export class GeneralRepository {
  private _activeSolutionAndDiagramService: IActiveSolutionAndDiagramService;
  private _identity: IIdentity;

  constructor(activeSolutionAndDiagramService: IActiveSolutionAndDiagramService) {
    this._activeSolutionAndDiagramService = activeSolutionAndDiagramService;
  }

  public async getAllDiagrams(): Promise<Array<IDiagram>> {
    const solutionEntry: ISolutionEntry = await this._activeSolutionAndDiagramService.getActiveSolutionEntry();
    const solution: ISolution = await solutionEntry.service.loadSolution();

    const allDiagramsInSolution: Array<IDiagram> = solution.diagrams;

    return allDiagramsInSolution;
  }
}
