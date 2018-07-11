import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {IIdentity} from '@essential-projects/core_contracts';
import {IPagination, IProcessDefEntity} from '@process-engine/bpmn-studio_client';
import {IDiagram, ISolution} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';

import {AuthenticationStateEvent, IFileInfo} from '../../contracts/index';
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
    /**
     * Check if BPMN-Studio runs in electron.
     */
    if ((<any> window).nodeRequire) {

      // Show the FileSystemSolutionExplorer.
      this.enableFileSystemSolutions = true;

      const ipcRenderer: any = (<any> window).nodeRequire('electron').ipcRenderer;
      const path: any = (<any> window).nodeRequire('path');

      // Register handler for double-click event fired from "elecrin.js".
      ipcRenderer.on('double-click-on-file', async(event: any, pathToFile: string) => {

        const solutionPath: string = pathToFile.substr(0, pathToFile.lastIndexOf('/'));
        await this._solutionExplorerServiceFileSystem.openSolution(solutionPath, this._identity);
        const solution: ISolution = await this._solutionExplorerServiceFileSystem.loadSolution();

        const diagramName: string = path.basename(pathToFile, '.bpmn');
        const diagram: IDiagram = await this._solutionExplorerServiceFileSystem.loadDiagram(diagramName);

        this.navigateToDiagramDetail(solution, diagram);
      });

      // Send event to signal the component is ready to handle the event.
      ipcRenderer.send('waiting-for-double-file-click');

      // Check if there was a double click before BPMN-Studio was loaded.
      const fileInfo: IFileInfo = ipcRenderer.sendSync('get_opened_file');

      if (fileInfo.path) {
        const solutionPath: string = fileInfo.path.substr(0, fileInfo.path.lastIndexOf('/'));

        await this._solutionExplorerServiceFileSystem.openSolution(solutionPath, this._identity);
        const solution: ISolution = await this._solutionExplorerServiceFileSystem.loadSolution();
        const diagramName: string = fileInfo.path.substring(fileInfo.path.lastIndexOf('/') + 1, fileInfo.path.length - this._bpmnSuffixLength);

        const diagram: IDiagram = await this._solutionExplorerServiceFileSystem.loadDiagram(diagramName);

        this.navigateToDiagramDetail(solution, diagram);
      }
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
    this._eventAggregator.publish(environment.events.navBar.updateProcess, diagram);
    this._router.navigateToRoute('diagram-detail', {diagramName: diagram.name});
  }

  private async _refreshProcesslist(): Promise<void> {
    this.processengineSolutionString = environment.bpmnStudioClient.baseRoute;
    await this._solutionExplorerServiceProcessEngine.openSolution(this.processengineSolutionString, this._identity);

    this.openedProcessEngineSolution = await this._solutionExplorerServiceProcessEngine.loadSolution();
  }
}
