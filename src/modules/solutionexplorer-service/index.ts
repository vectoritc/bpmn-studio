import {FrameworkConfiguration} from 'aurelia-framework';
import {ISolutionExplorerRepository} from 'solutionexplorer.repository.contracts';
import {SolutionExplorerService} from 'solutionexplorer.service';

export async function configure(config: FrameworkConfiguration, repository: ISolutionExplorerRepository): Promise<void> {

  const solutionExplorerService: SolutionExplorerService = new SolutionExplorerService(repository);

  config.container.registerInstance('SolutionExplorerService', solutionExplorerService);
}
