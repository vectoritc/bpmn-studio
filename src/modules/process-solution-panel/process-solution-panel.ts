import {inject} from 'aurelia-framework';

import {
  BpmnStudioClient,
  IPagination,
  IProcessDefEntity
} from '@process-engine/bpmn-studio_client';

@inject('BpmnStudioClient')
export class ProcessSolutionPanel {
  private _bpmnStudioClient: BpmnStudioClient;

  public processes: IPagination<IProcessDefEntity>;

  constructor(bpmnStudioClient: BpmnStudioClient) {
    this._bpmnStudioClient = bpmnStudioClient;
  }

  public async attached(): Promise<void> {
    this.processes = await this._bpmnStudioClient.getProcessDefList();
  }
}
