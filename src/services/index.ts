import {FrameworkConfiguration} from 'aurelia-framework';

import {ActiveSolutionAndDiagramService} from './ActiveSolutionDiagramService';

export async function configure(config: FrameworkConfiguration): Promise<void> {

  config.container.registerSingleton('ActiveSolutionAndDiagramService', ActiveSolutionAndDiagramService);
}
