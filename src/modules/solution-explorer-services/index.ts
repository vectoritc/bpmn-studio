import {IHttpClient} from '@essential-projects/http_contracts';
import {SolutionExplorerFileSystemRepository} from '@process-engine/solutionexplorer.repository.filesystem';
import {SolutionExplorerManagementApiRepository} from '@process-engine/solutionexplorer.repository.management_api';
import {SolutionExplorerService} from '@process-engine/solutionexplorer.service';
import {Container, FrameworkConfiguration} from 'aurelia-framework';

export async function configure(config: FrameworkConfiguration): Promise<void> {
  if ((<any> window).nodeRequire) {
    // only available if a filesystem is present
    registerFileSystem(config.container);
  }

  registerManagementApi(config.container);
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
}
