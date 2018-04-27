import {BpmnStudioClient, IPagination, IProcessDefEntity} from '@process-engine/bpmn-studio_client';
import {inject} from 'aurelia-framework';

@inject('BpmnStudioClient')
export class ProcessSolutionPanel {
  private bpmnStudioClient: BpmnStudioClient;
  public processes: IPagination<IProcessDefEntity>;

  constructor(bpmnStudioClient: BpmnStudioClient) {
    this.bpmnStudioClient = bpmnStudioClient;
  }

  public async attached(): Promise<void> {
    this.processes = await this.bpmnStudioClient.getProcessDefList();
  }

}
