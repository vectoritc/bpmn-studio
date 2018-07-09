import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {IIdentity} from '@essential-projects/core_contracts';
import {IPagination, IProcessDefEntity} from '@process-engine/bpmn-studio_client';
import {IDiagram, ISolution} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';

import {AuthenticationStateEvent} from '../../contracts/index';
import environment from '../../environment';

@inject(EventAggregator, Router, 'SolutionExplorerServiceProcessEngine', 'SolutionExplorerServiceFileSystem', 'Identity')
export class ProcessSolutionPanel {
  public processes: IPagination<IProcessDefEntity>;
  public processengineSolutionString: string;
  public openedProcessEngineSolution: ISolution;
  public openedFileSystemSolutions: Array<ISolution> = [];
  public solutionInput: HTMLInputElement;
  public enableFileSystemSolutions: boolean = false;
  public fileSystemIndexCardIsActive: boolean = false;
  public processEngineIndexCardIsActive: boolean = true;

  private _subscriptions: Array<Subscription>;
  private _eventAggregator: EventAggregator;
  private _router: Router;
  private _identity: IIdentity;
  private _solutionExplorerServiceProcessEngine: ISolutionExplorerService;
  private _solutionExplorerServiceFileSystem: ISolutionExplorerService;

  constructor(eventAggregator: EventAggregator,
              router: Router,
              solutionExplorerServiceProcessEngine: ISolutionExplorerService,
              solutionExplorerServiceFileSystem: ISolutionExplorerService) {

    this._eventAggregator = eventAggregator;
    this._router = router;
    this._solutionExplorerServiceProcessEngine = solutionExplorerServiceProcessEngine;
    this._solutionExplorerServiceFileSystem = solutionExplorerServiceFileSystem;
  }

  public async attached(): Promise<void> {
    // Check if BPMN-Studio runs in electron
    if ((<any> window).nodeRequire) {
      this.enableFileSystemSolutions = true;
    }

    this._refreshProcesslist();
    this._eventAggregator.publish(environment.events.processSolutionPanel.toggleProcessSolutionExplorer);

    /**
     * Set Interval to get the deployed processes of the currently connected Process Engine.
     */
    window.setInterval(async() => {
      this._refreshProcesslist();
    }, environment.processengine.poolingInterval);

    window.localStorage.setItem('processSolutionExplorerHideState', 'show');

    this._subscriptions = [
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this._refreshProcesslist();
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this._refreshProcesslist();
      }),
    ];

    const solutionInputButton: HTMLElement = document.getElementById('solutionInputButton');
    solutionInputButton.addEventListener('click', () => {
      this.solutionInput.click();
    });

    const firstSolutionInoutButton: HTMLElement = document.getElementById('openFirstSolutionButton');
    firstSolutionInoutButton.addEventListener('click', () => {
      this.solutionInput.click();
    });
  }

  public detached(): void {
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
    this._eventAggregator.publish(environment.events.processSolutionPanel.toggleProcessSolutionExplorer);

    window.localStorage.setItem('processSolutionExplorerHideState', 'hide');
  }

  /**
   * Handles the file input for the FileSystem Solutions.
   * @param event A event that holds the files that were "uploaded" by the user.
   * Currently there is no type for this kind of event.
   */
  public async onSolutionInputChange(event: any): Promise<void> {
    await this._solutionExplorerServiceFileSystem.openSolution(event.target.files[0].path, this._identity);
    const solution: ISolution = await this._solutionExplorerServiceFileSystem.loadSolution();
    this.openedFileSystemSolutions.push(solution);
    this.solutionInput.value = '';
  }

  public closeFileSystemSolution(solutionToClose: ISolution): void {
    const index: number = this.openedFileSystemSolutions.findIndex((solution: ISolution) => {
      return solution.uri === solutionToClose.uri;
    });
    this.openedFileSystemSolutions.splice(index, 1);
  }

  public openFileSystemIndexCard(): void {
    this.fileSystemIndexCardIsActive = true;
    this.processEngineIndexCardIsActive = false;
  }

  public openProcessEngineIndexCard(): void {
    this.fileSystemIndexCardIsActive = false;
    this.processEngineIndexCardIsActive = true;
  }

  public async navigateToDiagramDetail(solution: ISolution, diagram: IDiagram): Promise<void> {
    await this._solutionExplorerServiceFileSystem.openSolution(solution.uri, this._identity);
    this._router.navigateToRoute('diagram-detail', {diagramName: diagram.name});
  }

  private async _refreshProcesslist(): Promise<void> {
    this.processengineSolutionString = environment.bpmnStudioClient.baseRoute;
    await this._solutionExplorerServiceProcessEngine.openSolution(this.processengineSolutionString, this._identity);

    this.openedProcessEngineSolution = await this._solutionExplorerServiceProcessEngine.loadSolution();
  }
}
