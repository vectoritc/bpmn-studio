import {FrameworkConfiguration} from 'aurelia-framework';

import {SolutionService} from './ActiveSolutionDiagramService';

export async function configure(config: FrameworkConfiguration): Promise<void> {

  config.container.registerSingleton('SolutionService', SolutionService);
}
