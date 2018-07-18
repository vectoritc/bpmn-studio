import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {IIdentity} from '@essential-projects/core_contracts';
import {IPagination, IProcessDefEntity} from '@process-engine/bpmn-studio_client';
import {IDiagram, ISolution} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';

import {AuthenticationStateEvent, IFileInfo, IInputEvent, NotificationType} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from '../notification/notification.service';

@inject(EventAggregator, Router, 'SolutionExplorerServiceProcessEngine', 'SolutionExplorerServiceFileSystem', 'NotificationService', 'Identity')
export class ProcessSolutionPanel {
  public processes: IPagination<IProcessDefEntity>;
  public processengineSolutionString: string;
  public openedProcessEngineSolution: ISolution;
  public openedFileSystemSolutions: Array<ISolution> = [];
  public openedSingleDiagrams: Array<IDiagram> = [];
  public solutionInput: HTMLInputElement;
  public singleDiagramInput: HTMLInputElement;
  public openSingleDiagramButton: HTMLButtonElement;
  public openSolutionButton: HTMLButtonElement;
  public enableFileSystemSolutions: boolean = false;
  public fileSystemIndexCardIsActive: boolean = false;
  public processEngineIndexCardIsActive: boolean = true;

  private _subscriptions: Array<Subscription>;
  private _eventAggregator: EventAggregator;
  private _router: Router;
  private _notificationService: NotificationService;
  private _identity: IIdentity;
  private _solutionExplorerServiceProcessEngine: ISolutionExplorerService;
  private _solutionExplorerServiceFileSystem: ISolutionExplorerService;

  constructor(eventAggregator: EventAggregator,
              router: Router,
              solutionExplorerServiceProcessEngine: ISolutionExplorerService,
              solutionExplorerServiceFileSystem: ISolutionExplorerService,
              notificationService: NotificationService) {

    this._eventAggregator = eventAggregator;
    this._router = router;
    this._solutionExplorerServiceProcessEngine = solutionExplorerServiceProcessEngine;
    this._solutionExplorerServiceFileSystem = solutionExplorerServiceFileSystem;
    this._notificationService = notificationService;
  }

  public async attached(): Promise<void> {
    /**
     * Check if BPMN-Studio runs in electron.
     */
    if ((<any> window).nodeRequire) {

      // Show the FileSystemSolutionExplorer.
      this.enableFileSystemSolutions = true;

      const ipcRenderer: any = (<any> window).nodeRequire('electron').ipcRenderer;
      const path: string = (<any> window).nodeRequire('path');

      // Register handler for double-click event fired from "elecrin.js".
      ipcRenderer.on('double-click-on-file', async(event: Event, pathToFile: string) => {
        const diagram: IDiagram = await this._solutionExplorerServiceFileSystem.openSingleDiagram(pathToFile, this._identity);

        const diagramIsNotAlreadyOpen: boolean = this._findURIObject(this.openedSingleDiagrams, diagram.uri) === undefined;
        if (diagramIsNotAlreadyOpen) {
          this.openedSingleDiagrams.push(diagram);
        }

        this.navigateToDiagramDetail(diagram);
        this.openFileSystemIndexCard();
      });

      // Send event to signal the component is ready to handle the event.
      ipcRenderer.send('waiting-for-double-file-click');

      // Check if there was a double click before BPMN-Studio was loaded.
      const fileInfo: IFileInfo = ipcRenderer.sendSync('get_opened_file');

      if (fileInfo.path) {
        const diagram: IDiagram = await this._solutionExplorerServiceFileSystem.openSingleDiagram(fileInfo.path, this._identity);
        this.openedSingleDiagrams.push(diagram);
        this.navigateToDiagramDetail(diagram);
        this.openFileSystemIndexCard();
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
  public async onSolutionInputChange(event: IInputEvent): Promise<void> {
    await this._solutionExplorerServiceFileSystem.openSolution(event.target.files[0].path, this._identity);
    const newSolution: ISolution = await this._solutionExplorerServiceFileSystem.loadSolution();

    this.solutionInput.value = '';

    const solutionIsAlreadyOpen: boolean = this._findURIObject(this.openedFileSystemSolutions, newSolution.uri) !== undefined;

    if (solutionIsAlreadyOpen) {
      this._notificationService.showNotification(NotificationType.INFO, 'Solution is already open');

      return;
    }

    this.openedFileSystemSolutions.push(newSolution);
  }

  /**
   * Handles the file input change event for the single file input.
   * @param event A event that holds the files that were "uploaded" by the user.
   * Currently there is no type for this kind of event.
   */
  public async onSingleDiagramInputChange(event: IInputEvent): Promise<void> {
    const pathToDiagram: string = event.target.files[0].path;
    const newDiagram: IDiagram = await this._solutionExplorerServiceFileSystem.openSingleDiagram(pathToDiagram, this._identity);

    this.singleDiagramInput.value = '';

    const diagramIsAlreadyOpen: boolean = this._findURIObject(this.openedSingleDiagrams, newDiagram.uri) !== undefined;

    if (diagramIsAlreadyOpen) {
      this._notificationService.showNotification(NotificationType.INFO, 'Diagram is already open');

      return;
    }

    this.openedSingleDiagrams.push(newDiagram);
  }

  public closeFileSystemSolution(solutionToClose: ISolution): void {
    const index: number = this.openedFileSystemSolutions.findIndex((solution: ISolution) => {
      return solution.uri === solutionToClose.uri;
    });
    this.openedFileSystemSolutions.splice(index, 1);
  }

  public closeSingleDiagram(diagramToClose: IDiagram): void {
    const index: number = this.openedSingleDiagrams.findIndex((diagram: IDiagram) => {
      return diagram.uri === diagramToClose.uri;
    });

    this.openedSingleDiagrams.splice(index, 1);
  }

  public openFileSystemIndexCard(): void {
    this.fileSystemIndexCardIsActive = true;
    this.processEngineIndexCardIsActive = false;
  }

  public openProcessEngineIndexCard(): void {
    this.fileSystemIndexCardIsActive = false;
    this.processEngineIndexCardIsActive = true;
  }

  public async refreshSolutions(): Promise<void> {
    this.openedFileSystemSolutions.forEach(async(solution: ISolution) => {
      try {
        await this._solutionExplorerServiceFileSystem.openSolution(solution.uri, this._identity);
        const updatetSolution: ISolution = await this._solutionExplorerServiceFileSystem.loadSolution();
        this._updateSolution(solution, updatetSolution);
      } catch (e) {
        this.closeFileSystemSolution(solution);
      }
    });
  }

  public async navigateToDiagramDetail(diagram: IDiagram): Promise<void> {
    this._eventAggregator.publish(environment.events.navBar.updateProcess, diagram);
    this._router.navigateToRoute('diagram-detail', {diagramUri: diagram.uri});
  }

  private async _refreshProcesslist(): Promise<void> {
    this.processengineSolutionString = environment.bpmnStudioClient.baseRoute;
    await this._solutionExplorerServiceProcessEngine.openSolution(this.processengineSolutionString, this._identity);

    this.openedProcessEngineSolution = await this._solutionExplorerServiceProcessEngine.loadSolution();
  }

  private _updateSolution(solutionToUpdate: ISolution, solution: ISolution): void {
    const index: number = this.openedFileSystemSolutions.indexOf(solutionToUpdate);
    this.openedFileSystemSolutions.splice(index, 1, solution);
  }

  private _findURIObject<T extends {uri: string}>(objects: Array<T>, targetURI: string): T {
    const foundObject: T = objects.find((object: T): boolean => {
      return object.uri === targetURI;
    });

    return foundObject;
  }
}
