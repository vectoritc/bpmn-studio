import { IDiagram, ISolution } from '@process-engine/solutionexplorer.contracts';
import { ISolutionExplorerService } from '@process-engine/solutionexplorer.service.contracts';
import { bindable } from 'aurelia-framework';

export class SolutionExplorerSolution {

  @bindable
  private solutionService: ISolutionExplorerService;
  private openedSolution: ISolution;

  constructor() {
    setInterval(async() =>  {
      try {
        const solution: ISolution = await this.solutionService.loadSolution();

        this.openedSolution = solution;

      } catch (e) {
        console.log(e);
      }
    }, 1000);
  }

  public async solutionServiceChanged(newValue: ISolutionExplorerService, oldValue: ISolutionExplorerService): Promise<void> {
    try {
      const solution: ISolution = await this.solutionService.loadSolution();

      this.openedSolution = solution;

    } catch (e) {
      console.log(e);
    }
  }

  public get solutionIsNotLoaded(): boolean {
    return this.openedSolution === null || this.openedSolution === undefined;
  }

  public get solutionName(): string {
    if (this.openedSolution) {
      return this.openedSolution.name;
    }
  }

  public get openedDiagrams(): Array<IDiagram> {
    if (this.openedSolution) {
      return this.openedSolution.diagrams;
    } else {
      return [];
    }
  }
}
