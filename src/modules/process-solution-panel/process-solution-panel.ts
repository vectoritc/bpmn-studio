import {inject, observable} from 'aurelia-framework';

import {IIdentity} from '@essential-projects/core_contracts';
import {
  BpmnStudioClient,
  IPagination,
  IProcessDefEntity,
} from '@process-engine/bpmn-studio_client';
import {ISolution} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {AuthenticationStateEvent} from '../../contracts/index';
import environment from '../../environment';

@inject(EventAggregator, 'SolutionExplorerServiceProcessEngine', 'SolutionExplorerServiceFileSystem', 'Identity')
export class ProcessSolutionPanel {
  public processes: IPagination<IProcessDefEntity>;
  public processengineSolutionString: string;
  public openedProcessEngineSolution: ISolution;
  public openedFileSystemSolutions: Array<ISolution> = [];
  public enableFileSystemSolutions: boolean = false;
  public fileSystemIndexCardIsActive: boolean = false;
  public processEngineIndexCardIsActive: boolean = true;

  private _subscriptions: Array<Subscription>;
  private _eventAggregator: EventAggregator;
  private _identity: IIdentity;
  private _solutionExplorerServiceProcessEngine: ISolutionExplorerService;
  private _solutionExplorerServiceFileSystem: ISolutionExplorerService;
  private _initialRequestSuccesfull: boolean = false;

  constructor(eventAggregator: EventAggregator,
              solutionExplorerServiceProcessEngine: ISolutionExplorerService,
              solutionExplorerServiceFileSystem: ISolutionExplorerService) {

    this._eventAggregator = eventAggregator;
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

    window.localStorage.setItem('processSolutionExplorerHideState', 'show');

    this._subscriptions = [
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this._refreshProcesslist();
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this._refreshProcesslist();
      }),
    ];

    /**
     * Set Intervat to get the deployed processes of the currently connected Process Engine.
     */
    window.setInterval(async() => {
      this._refreshProcesslist();

    }, environment.processengine.poolingInterval);

    const solutionInput: HTMLElement = document.getElementById('solutionInput');
    const solutionInputButton: HTMLElement = document.getElementById('solutionInputButton');
    solutionInputButton.addEventListener('click', (event: any) => {
      solutionInput.click();
    });
  }

  public detached(): void {
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
    this._eventAggregator.publish(environment.events.processSolutionPanel.toggleProcessSolutionExplorer);

    window.localStorage.setItem('processSolutionExplorerHideState', 'hide');
  }

  public async openProcessEngineSolution(): Promise<void> {

    await this._solutionExplorerServiceProcessEngine.openSolution(this.processengineSolutionString, this._identity);
    this.openedProcessEngineSolution = await this._solutionExplorerServiceProcessEngine.loadSolution();
  }

  public async onSolutionInputChange(event: any): Promise<void> {

    await this._solutionExplorerServiceFileSystem.openSolution(event.target.files[0].path, this._identity);
    const solution: ISolution = await this._solutionExplorerServiceFileSystem.loadSolution();

    this.openedFileSystemSolutions.push(solution);
  }

  public closeFileSystemSolution(solutionToClose: ISolution): void {
    const index: number = this.openedFileSystemSolutions.findIndex((solution: ISolution) => {
      return solution.uri === solutionToClose.uri;
    });
    this.openedFileSystemSolutions.splice(index);
  }

  public openFileSystemIndexCard(): void {
    this.fileSystemIndexCardIsActive = true;
    this.processEngineIndexCardIsActive = false;
  }

  public openProcessEngineIndexCard(): void {
    this.fileSystemIndexCardIsActive = false;
    this.processEngineIndexCardIsActive = true;
  }

  private async _refreshProcesslist(): Promise<void> {
    this.processengineSolutionString = environment.bpmnStudioClient.baseRoute;
    await this.openProcessEngineSolution();

    this.openedProcessEngineSolution = await this._solutionExplorerServiceProcessEngine.loadSolution();
  }
}
