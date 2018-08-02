import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {
  FluentRuleCustomizer,
  ValidateEvent,
  ValidateResult,
  ValidationController,
  ValidationRules,
} from 'aurelia-validation';

import {IIdentity} from '@essential-projects/core_contracts';
import {ForbiddenError, isError, UnauthorizedError} from '@essential-projects/errors_ts';
import {IDiagram, ISolution} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';

import {
  AuthenticationStateEvent,
  IAuthenticationService,
  IDiagramCreationService,
  IDiagramValidationService,
  IFile,
  IInputEvent,
  NotificationType,
} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from '../notification/notification.service';

const ENTER_KEY: string = 'Enter';
const ESCAPE_KEY: string = 'Escape';

export interface IViewModelSolution extends ISolution {
  isCreateDiagramInputShown: boolean;
  createNewDiagramInput: HTMLInputElement;
  documentEventHandlers: Map<string, (event: any) => void>;
  currentDiagramInputValue: string;
  errors: Array<ValidateResult>;
}

@inject(
  EventAggregator,
  Router,
  ValidationController,
  'SolutionExplorerServiceManagementApi',
  'SolutionExplorerServiceFileSystem',
  'NotificationService',
  'DiagramValidationService',
  'AuthenticationService',
  'DiagramCreationService',
)
export class ProcessSolutionPanel {
  public openedProcessEngineSolution: ISolution | null;
  public openedFileSystemSolutions: Array<IViewModelSolution> = [];
  public openedSingleDiagrams: Array<IDiagram> = [];
  public solutionInput: HTMLInputElement;
  public singleDiagramInput: HTMLInputElement;
  public openSingleDiagramButton: HTMLButtonElement;
  public openSolutionButton: HTMLButtonElement;
  public enableFileSystemSolutions: boolean = false;
  public fileSystemIndexCardIsActive: boolean = false;
  public processEngineIndexCardIsActive: boolean = true;

  private _subscriptions: Array<Subscription> = [];
  private _eventAggregator: EventAggregator;
  private _router: Router;
  private _validationController: ValidationController;
  private _notificationService: NotificationService;
  private _solutionExplorerServiceManagementApi: ISolutionExplorerService;
  private _solutionExplorerServiceFileSystem: ISolutionExplorerService;
  private _diagramValidationService: IDiagramValidationService;
  private _authenticationService: IAuthenticationService;
  private _diagramCreationService: IDiagramCreationService;
  private _identity: IIdentity;
  private _solutionExplorerIdentity: IIdentity;
  private _newDiagramNameValidator: FluentRuleCustomizer<IViewModelSolution, IViewModelSolution> = ValidationRules
      .ensure((solution: IViewModelSolution) => solution.currentDiagramInputValue)
      .displayName('Diagram name')
      .required()
        .withMessage('Diagram name cannot be blank.')
      .then()
      .satisfies((input: string, solution: IViewModelSolution) => {
        const diagramUri: string = `${solution.uri}/${input}.bpmn`;
        const diagramWithIdDoesNotExists: boolean = this._findURIObject(solution.diagrams, diagramUri) === undefined;

        return diagramWithIdDoesNotExists;
      })
        .withMessage('A diagram with that name already exists.');

  constructor(eventAggregator: EventAggregator,
              router: Router,
              validationController: ValidationController,
              solutionExplorerServiceManagementApi: ISolutionExplorerService,
              solutionExplorerServiceFileSystem: ISolutionExplorerService,
              notificationService: NotificationService,
              diagramValidationService: IDiagramValidationService,
              authenticationService: IAuthenticationService,
              diagramCreationService: IDiagramCreationService,
            ) {

    this._eventAggregator = eventAggregator;
    this._router = router;
    this._validationController = validationController;
    this._solutionExplorerServiceManagementApi = solutionExplorerServiceManagementApi;
    this._solutionExplorerServiceFileSystem = solutionExplorerServiceFileSystem;
    this._notificationService = notificationService;
    this._diagramValidationService = diagramValidationService;
    this._authenticationService = authenticationService;
    this._diagramCreationService = diagramCreationService;
  }

  public async attached(): Promise<void> {
    /**
     * Check if BPMN-Studio runs in electron.
     */
    if ((window as any).nodeRequire) {

      // Show the FileSystemSolutionExplorer.
      this.enableFileSystemSolutions = true;

      const ipcRenderer: any = (window as any).nodeRequire('electron').ipcRenderer;

      // Register handler for double-click event fired from "elecron.js".
      ipcRenderer.on('double-click-on-file', async(event: Event, pathToFile: string) => {
        const diagram: IDiagram = await this._solutionExplorerServiceFileSystem.openSingleDiagram(pathToFile, this._identity);

        try {
          const diagramAlreadyOpen: boolean = !await this._openSingleDiagram(diagram);

          if (diagramAlreadyOpen) {
            this._notificationService.showNotification(NotificationType.INFO, 'Diagram is already opened.');
          }
        } catch (error) {
          this._notificationService.showNotification(NotificationType.ERROR, error.message);
        }

        this.openFileSystemIndexCard();
      });

      // Send event to signal the component is ready to handle the event.
      ipcRenderer.send('waiting-for-double-file-click');

      // Check if there was a double click before BPMN-Studio was loaded.
      const fileInfo: IFile = ipcRenderer.sendSync('get_opened_file');

      if (fileInfo.path) {
        const diagram: IDiagram = await this._solutionExplorerServiceFileSystem.openSingleDiagram(fileInfo.path, this._identity);

        try {
          await this._openSingleDiagram(diagram);
        } catch (error) {
          this._notificationService.showNotification(NotificationType.ERROR, error.message);
        }

        this.openFileSystemIndexCard();
      }
    }

    this._solutionExplorerIdentity = await this._createIdentityForSolutionExplorer();

    this._refreshProcesslist();
    this._eventAggregator.publish(environment.events.processSolutionPanel.toggleProcessSolutionExplorer);

    /**
     * Set Interval to get the deployed processes of the currently connected ProcessEngine.
     */
    window.setInterval(async() => {
      this._refreshProcesslist();
    }, environment.processengine.pollingIntervalInMs);

    window.localStorage.setItem('processSolutionExplorerHideState', 'show');

    this._subscriptions = [
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this._refreshProcesslist();
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this._refreshProcesslist();
      }),
      this._eventAggregator.subscribe(environment.events.refreshProcessDefs, () => {
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

    const viewModelSolution: IViewModelSolution = this.
      _createViewModelSolutionFromSolution(newSolution);

    this.openedFileSystemSolutions.push(viewModelSolution);
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

    try {
      const diagramAlreadyOpen: boolean = !await this._openSingleDiagram(newDiagram);

      if (diagramAlreadyOpen) {
        this._notificationService.showNotification(NotificationType.INFO, 'Diagram is already opened.');
      }
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, error.message);
    }
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
    this.openedFileSystemSolutions.forEach(async(solution: IViewModelSolution) => {
      try {
        await this._solutionExplorerServiceFileSystem.openSolution(solution.uri, this._identity);
        const updatetSolution: ISolution = await this._solutionExplorerServiceFileSystem.loadSolution();

        const viewModelSolution: IViewModelSolution = this
          ._createViewModelSolutionFromSolution(updatetSolution);

        this._updateSolution(solution, viewModelSolution);
      } catch (e) {
        this.closeFileSystemSolution(solution);
      }
    });
  }

  public async navigateToDiagramDetail(diagram: IDiagram): Promise<void> {
    this._eventAggregator.publish(environment.events.navBar.updateProcess, diagram);

    this._router.navigateToRoute('diagram-detail', {
      diagramUri: diagram.uri,
    });
  }

  public showCreateDiagramInput(solution: IViewModelSolution): void {
    if (solution.isCreateDiagramInputShown) {
      return;
    }

    solution.isCreateDiagramInputShown = true;

    this._newDiagramNameValidator.on(solution);

    this._validationController.subscribe((event: ValidateEvent) => {
      solution.errors = event.errors;
    });

    window.setTimeout(() => {
      solution.createNewDiagramInput.focus();
    }, 0);

    const clickEventHandler: (event: MouseEvent) => void = (event: MouseEvent): void => {
      this._onCreateNewDiagramClickEvent(solution, event);
    };
    const keyEventHandler: (event: KeyboardEvent) => void = (event: KeyboardEvent): void => {
      this._onCreateNewDiagramKeyupEvent(solution, event);
    };

    solution.documentEventHandlers.set('click', clickEventHandler);
    solution.documentEventHandlers.set('keyup', keyEventHandler);

    document.addEventListener('click', clickEventHandler);
    document.addEventListener('keyup', keyEventHandler);
  }

  public isCreateDiagramInputShown(solution: IViewModelSolution): boolean {
    return solution.isCreateDiagramInputShown;
  }

  private async _onCreateNewDiagramClickEvent(solution: IViewModelSolution, event: MouseEvent): Promise<void> {

    const inputWasClicked: boolean = event.target === solution.createNewDiagramInput;

    if (inputWasClicked) {
      return;
    }

    const inputHasNoValue: boolean = !this._hasNonEmptyValue(solution.createNewDiagramInput);
    if (inputHasNoValue) {
      this._resetDiagramCreation(solution);
      return;
    }

    const diagramUri: string = `${solution.uri}/${solution.currentDiagramInputValue}.bpmn`;

    try {
      await this._diagramCreationService
        .createNewDiagram(this._solutionExplorerServiceFileSystem, solution, solution.currentDiagramInputValue);
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, error.message);
      return;
    }

    this.refreshSolutions();
    this._resetDiagramCreation(solution);

    this._router.navigateToRoute('diagram-detail', {
      diagramUri: diagramUri,
    });
  }

  private async _onCreateNewDiagramKeyupEvent(solution: IViewModelSolution, event: KeyboardEvent): Promise<void> {

    const pressedKey: string = event.key;

    if (pressedKey === ENTER_KEY) {

      const inputHasNoValue: boolean = !this._hasNonEmptyValue(solution.createNewDiagramInput);
      if (inputHasNoValue) {
        return;
      }

      const solutionPath: string = solution.uri;
      const fileName: string = solution.currentDiagramInputValue;
      const diagramUri: string = `${solutionPath}/${fileName}.bpmn`;

      try {
        await this._diagramCreationService
          .createNewDiagram(this._solutionExplorerServiceFileSystem, solution, solution.currentDiagramInputValue);
      } catch (error) {
        this._notificationService.showNotification(NotificationType.ERROR, error.message);
        return;
      }

      this.refreshSolutions();
      this._resetDiagramCreation(solution);

      this._router.navigateToRoute('diagram-detail', {
        diagramUri: diagramUri,
      });

    } else if (pressedKey === ESCAPE_KEY) {

      this._resetDiagramCreation(solution);

    }
  }

  private _hasNonEmptyValue(input: HTMLInputElement): boolean {
    const inputValue: string = input.value;

    const inputHasValue: boolean = inputValue !== undefined
                                && inputValue !== null
                                && inputValue !== '';

    return inputHasValue;
  }

  private _resetDiagramCreation(solution: IViewModelSolution): void {
    // Remove all used event listeners.
    solution.documentEventHandlers.forEach((eventHandler: (event: any) => any, eventName: string): void => {
      document.removeEventListener(eventName, eventHandler);
    });
    solution.documentEventHandlers = new Map();

    // Reset input field.
    solution.currentDiagramInputValue = '';
    solution.createNewDiagramInput.value = '';
    // Hide input field.
    solution.isCreateDiagramInputShown = false;

    ValidationRules.off(solution);
  }

  private async _openSingleDiagram(newDiagram: IDiagram): Promise<boolean> {
    const diagramWithSameURI: IDiagram = this._findURIObject(this.openedSingleDiagrams, newDiagram.uri);

    const diagramIsAlreadyOpened: boolean = diagramWithSameURI !== undefined;

    if (diagramIsAlreadyOpened) {
      // When the diagram is already opened we just navigate to that.
      this.navigateToDiagramDetail(diagramWithSameURI);

      return false;
    }

    await this._diagramValidationService
      .validate(newDiagram.xml)
      .isXML()
      .isBPMN()
      .throwIfError();

    this.openedSingleDiagrams.push(newDiagram);
    this.navigateToDiagramDetail(newDiagram);

    return true;
  }

  private async _refreshProcesslist(): Promise<void> {
    const customProcessEngineRoute: string = window.localStorage.getItem('processEngineRoute');
    const isCustomProcessEngineRouteSet: boolean = customProcessEngineRoute !== ''
                                                && customProcessEngineRoute !== null;

    const processengineSolutionString: string = isCustomProcessEngineRouteSet
    ? customProcessEngineRoute
    : window.localStorage.getItem('InternalProcessEngineRoute');

    try {
      await this._solutionExplorerServiceManagementApi.openSolution(processengineSolutionString, this._solutionExplorerIdentity);
      this.openedProcessEngineSolution = await this._solutionExplorerServiceManagementApi.loadSolution();

    } catch (error) {
      if (isError(error, UnauthorizedError)) {
        this._notificationService.showNotification(NotificationType.ERROR, 'You need to login to list process models.');
      } else if (isError(error, ForbiddenError)) {
        this._notificationService.showNotification(NotificationType.ERROR, 'You don\'t have the required permissions to list process models.');
      }

      this.openedProcessEngineSolution = null;
    }
  }

  private _updateSolution(solutionToUpdate: IViewModelSolution, solution: IViewModelSolution): void {
    const index: number = this.openedFileSystemSolutions.indexOf(solutionToUpdate);
    this.openedFileSystemSolutions.splice(index, 1, solution);
  }

  private async _createIdentityForSolutionExplorer(): Promise<IIdentity> {
    const solutionExplorerIdentity: IIdentity = await this._authenticationService.getIdentity() || {} as IIdentity;

    const solutionExplorerAccessToken: {accessToken: string} = {
      accessToken: this._authenticationService.getAccessToken(),
    };

    Object.assign(solutionExplorerIdentity, solutionExplorerAccessToken);

    return solutionExplorerIdentity;
  }

  private _createViewModelSolutionFromSolution(solution: ISolution): IViewModelSolution {
    const viewModelSolution: IViewModelSolution = {
      isCreateDiagramInputShown: false,
      createNewDiagramInput: null,
      documentEventHandlers: new Map(),
      currentDiagramInputValue: null,
      errors: [],
      ...solution,
    };

    return viewModelSolution;
  }

  private _findURIObject<T extends {uri: string}>(objects: Array<T>, targetURI: string): T {
    const foundObject: T = objects.find((object: T): boolean => {
      return object.uri.toLowerCase() === targetURI.toLowerCase();
    });

    return foundObject;
  }
}
