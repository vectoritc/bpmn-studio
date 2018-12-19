import {inject} from 'aurelia-framework';

import {IDiagram, ISolution} from '@process-engine/solutionexplorer.contracts';

import {ISolutionEntry, ISolutionService} from '../../../../../../contracts';

@inject('SolutionService')
export class GeneralRepository {
  private _solutionService: ISolutionService;

  constructor(solutionService: ISolutionService) {
    this._solutionService = solutionService;
  }

  public async getAllDiagrams(): Promise<Array<IDiagram>> {
    const remoteSolutionUri: string = window.localStorage.getItem('processEngineRoute');

    const solutionEntry: ISolutionEntry = await this._solutionService.getSolutionEntryForUri(remoteSolutionUri);
    const solution: ISolution = await solutionEntry.service.loadSolution();

    const allDiagramsInSolution: Array<IDiagram> = solution.diagrams;

    return allDiagramsInSolution;
  }
}
