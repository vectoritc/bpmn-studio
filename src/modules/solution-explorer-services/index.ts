import {EventAggregator} from 'aurelia-event-aggregator';
import {Container, FrameworkConfiguration} from 'aurelia-framework';

import {IIdentity} from '@essential-projects/core_contracts';
import {IHttpClient} from '@essential-projects/http_contracts';
import {SolutionExplorerFileSystemRepository} from '@process-engine/solutionexplorer.repository.filesystem';
import {SolutionExplorerManagementApiRepository} from '@process-engine/solutionexplorer.repository.management_api';
import {SolutionExplorerService} from '@process-engine/solutionexplorer.service';

import {IAuthenticationService} from '../../contracts';
import {AuthenticationStateEvent} from '../../contracts/index';
import environment from '../../environment';
import {SolutionExplorerServiceFactory} from './SolutionExplorerServiceFactory';

export async function configure(config: FrameworkConfiguration): Promise<void> {
  if ((window as any).nodeRequire) {
    // only available if a filesystem is present
    registerFileSystem(config.container);
  }

  registerManagementApi(config.container);

  config.container.registerSingleton('SolutionExplorerServiceFactory', SolutionExplorerServiceFactory);
}

function registerFileSystem(container: Container): void {
  const fileSystemrepository: SolutionExplorerFileSystemRepository = new SolutionExplorerFileSystemRepository();
  const filesystemSolutionexplorerService: SolutionExplorerService = new SolutionExplorerService(fileSystemrepository);

  container.registerInstance('SolutionExplorerServiceFileSystem', filesystemSolutionexplorerService);
}

function registerManagementApi(container: Container): void {
  const httpClient: IHttpClient = container.get('HttpFetchClient');
  const managementApiRepository: SolutionExplorerManagementApiRepository = new SolutionExplorerManagementApiRepository(httpClient);
  const solutionexplorerService: SolutionExplorerService = new SolutionExplorerService(managementApiRepository);

  container.registerInstance('SolutionExplorerServiceManagementApi', solutionexplorerService);

  /*
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

  const setupSideEffectFix: () => void = (): void => {

    const authenticationService: IAuthenticationService =  container.get('AuthenticationService');
    const eventAggregator: EventAggregator = container.get(EventAggregator);

    const createIdentityForSolutionExplorer: () => IIdentity = (): IIdentity => {
      const identity: IIdentity = {} as IIdentity;

      const solutionExplorerAccessToken: {accessToken: string} = {
        accessToken: authenticationService.getAccessToken(),
      };

      Object.assign(identity, solutionExplorerAccessToken);

      return identity;
    };

    const updateSolutionService: () => void  = (): void => {
      solutionexplorerService.openSolution(getCurrentlyConfiguredProcessEngineRoute(), createIdentityForSolutionExplorer());
    };

    eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, updateSolutionService);
    eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, updateSolutionService);

    eventAggregator.subscribe(environment.events.configPanel.processEngineRouteChanged,
      (newRoute: string) => {
        solutionexplorerService.openSolution(newRoute, createIdentityForSolutionExplorer());
      });

    updateSolutionService();
  };

  const waitTimeout: number = 5000;

  /*
   * We need to wait until aurelia is ready before we can get the event
   * aggregator.
   */
  window.setTimeout(setupSideEffectFix, waitTimeout);
}

// TODO: Migrate this method once we have a proper config service.
function getCurrentlyConfiguredProcessEngineRoute(): string {
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
