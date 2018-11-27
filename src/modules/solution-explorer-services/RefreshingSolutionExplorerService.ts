import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';

import {IIdentity} from '@essential-projects/iam_contracts';
import {IDiagram, ISolution} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';

import {IAuthenticationService} from '../../contracts';
import {AuthenticationStateEvent} from '../../contracts/index';
import environment from '../../environment';

/**
 * In some parts of the code, this service is injected. Then the solution
 * explorer service is used to query the current solution and its diagrams.
 *
 * This solution explorer is a singleton, this causes a big problem:
 * In some parts of the code we rely on side effects caused by different
 * modules.
 *
 * For example: In many cases, the solution explorer gets injected and the
 * using class assumes that openSolution was already called.
 *
 * We fix this by handling this side effects in here.
 */
@inject(
  'SolutionExplorerServiceManagementApi_NotRefreshing',
  'AuthenticationService',
  EventAggregator,
)
export class RefreshingSolutionExplorerService implements ISolutionExplorerService {

  private _parent: ISolutionExplorerService;
  private _authenticationService: IAuthenticationService;
  private _eventAggregator: EventAggregator;
  private _initializePromise: Promise<any>;

  constructor(
    parent: ISolutionExplorerService,
    authenticationService: IAuthenticationService,
    eventAggregator: EventAggregator,
  ) {
    this._parent = parent;
    this._authenticationService = authenticationService;
    this._eventAggregator = eventAggregator;

    this._registerListeners();
    this._initializePromise = this._updateSolutionService();
  }

  public openSolution(pathspec: string, identity: IIdentity): Promise<void> {
    return this._parent.openSolution(pathspec, identity);
  }

  public async loadSolution(): Promise<ISolution> {
    await this._initializePromise;

    return this._parent.loadSolution();
  }

  public loadDiagram(diagramName: string): Promise<IDiagram> {
    return this._parent.loadDiagram(diagramName);
  }

  // public openSingleDiagram(pathToDiagram: string, identity: IIdentity): Promise<IDiagram> {
  //   return this._parent.openSingleDiagram(pathToDiagram, identity);
  // }

  // public saveSingleDiagram(diagramToSave: IDiagram, identity: IIdentity, path?: string): Promise<IDiagram> {
  //   return this._parent.saveSingleDiagram(diagramToSave, identity, path);
  // }

  public saveSolution(solution: ISolution, pathspec?: string): Promise<void> {
    return this._parent.saveSolution(solution, pathspec);
  }

  public saveDiagram(diagram: IDiagram, pathspec?: string): Promise<void> {
    return this._parent.saveDiagram(diagram, pathspec);
  }

  public renameDiagram(diagram: IDiagram, newName: string): Promise<IDiagram> {
    return this._parent.renameDiagram(diagram, newName);
  }

  public deleteDiagram(diagram: IDiagram): Promise<void> {
    return this._parent.deleteDiagram(diagram);
  }

  private _registerListeners(): void {

    this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, this._updateSolutionService);
    this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, this._updateSolutionService);

    this._eventAggregator.subscribe(environment.events.configPanel.processEngineRouteChanged,
      (newRoute: string) => {

        const identity: IIdentity = this._createIdentityForSolutionExplorer();

        this.openSolution(newRoute, identity);
      });
  }

  private _updateSolutionService: () => Promise<void>  = (): Promise<void> => {
    const processEngineRoute: string = this._getCurrentlyConfiguredProcessEngineRoute();
    const identity: IIdentity = this._createIdentityForSolutionExplorer();

    return this.openSolution(processEngineRoute, identity);
  }

  private _createIdentityForSolutionExplorer(): IIdentity {
    const accessToken: string = this._authenticationService.getAccessToken();
    const identity: IIdentity = {
      token: accessToken,
    };

    return identity;
  }

   // TODO: Migrate this method once we have a proper config service.
   private _getCurrentlyConfiguredProcessEngineRoute(): string {
    const customProcessEngineRoute: string = window.localStorage.getItem('processEngineRoute');
    const customProcessEngineRouteSet: boolean = customProcessEngineRoute !== ''
                                                 && customProcessEngineRoute !== null
                                                 && customProcessEngineRoute !== undefined;

    if (customProcessEngineRouteSet) {
      return customProcessEngineRoute;
    }

    const internalProcessEngineRoute: string = window.localStorage.getItem('InternalProcessEngineRoute');

    return internalProcessEngineRoute;
  }
}
