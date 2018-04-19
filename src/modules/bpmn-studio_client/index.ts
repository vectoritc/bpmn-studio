import {BpmnStudioClient, ITokenRepository} from '@process-engine/bpmn-studio_client';
import {FrameworkConfiguration} from 'aurelia-framework';
import environment from '../../environment';

export async function configure(config: FrameworkConfiguration, tokenRepository: ITokenRepository): Promise<void> {

  const bpmnStudioClient: BpmnStudioClient = new BpmnStudioClient();
  bpmnStudioClient.config = environment.bpmnStudioClient;
  await bpmnStudioClient.initialize(tokenRepository);

  config.container.registerInstance('BpmnStudioClient', bpmnStudioClient);
}
