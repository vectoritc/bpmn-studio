import {IDiagram, ISolution} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';
import {EventAggregator} from 'aurelia-event-aggregator';
import {bindable, inject} from 'aurelia-framework';
import {PipelineResult, Router} from 'aurelia-router';
import environment from '../../../environment';

@inject(Router, EventAggregator)
export class SolutionExplorerSolution {

  private _router: Router;
  private _eventAggregator: EventAggregator;

  @bindable({attribute: 'solution-service'})
  private _solutionService: ISolutionExplorerService;
  private _openedSolution: ISolution;

  constructor(router: Router, eventAggregator: EventAggregator) {
    this._router = router;
    this._eventAggregator = eventAggregator;

    // TODO (ph): Move this into attached / detached.
    setInterval(async() =>  {
      this.updateSolution();
    }, 1000); // TODO config
  }

  public async solutionServiceChanged(newValue: ISolutionExplorerService, oldValue: ISolutionExplorerService): Promise<void> {
    this.updateSolution();
  }

  public async updateSolution(): Promise<void> {
    const solution: ISolution = await this._solutionService.loadSolution();

    this._openedSolution = solution;
  }

  public canRenameDiagram(): boolean {
    return false;
  }

  public canDeleteDiagram(): boolean {
    return false;
  }

  public get solutionIsNotLoaded(): boolean {
    return this._openedSolution === null || this._openedSolution === undefined;
  }

  public get openedDiagrams(): Array<IDiagram> {
    if (this._openedSolution) {
      return this._openedSolution.diagrams;
    } else {
      return [];
    }
  }

  public async navigateToDetailView(diagram: IDiagram): Promise<void> {
    // TODO: Remove this if cause if we again have one detail view.
    const diagramIsOpenedFromRemote: boolean = diagram.uri.startsWith('http');

    if (diagramIsOpenedFromRemote) {
      await this._router.navigateToRoute('processdef-detail', {
        processModelId: diagram.id,
      });

    } else {

      const navigationResult: boolean = await this._router.navigateToRoute('diagram-detail', {
        diagramUri: diagram.uri,
      });

      // This is needed, because navigateToRoute returns an object even though a boolean should be returned
      const navigationSuccessful: boolean = (typeof(navigationResult) === 'boolean')
        ? navigationResult
        : (navigationResult as PipelineResult).completed;

      if (navigationSuccessful) {
        this._eventAggregator.publish(environment.events.navBar.updateProcess, diagram);
      }
    }

  }

}
