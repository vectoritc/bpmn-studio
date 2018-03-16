import {BpmnStudioClient, IPagination, IProcessDefEntity} from '@process-engine/consumer_client';
import {HttpClient} from 'aurelia-fetch-client';
import {inject} from 'aurelia-framework';
import environment from '../../../../../environment';

@inject('BpmnStudioClient', HttpClient)
export class GeneralRepository {
  private bpmnStudioClient: BpmnStudioClient;
  private httpClient: HttpClient;

  constructor(bpmnStudioClient: BpmnStudioClient, httpClient: HttpClient) {
    this.bpmnStudioClient = bpmnStudioClient;
    this.httpClient = httpClient;
  }

  public async getAllProcesses(): Promise<IPagination<IProcessDefEntity>> {
    return this.bpmnStudioClient.getProcessDefList();
  }

  public updateProcessDef(processDef: IProcessDefEntity, xml: string): Promise<any> {
    const options: RequestInit = {
      method: 'post',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
          xml: xml,
      }),
    };
    const url: string = `${environment.processengine.routes.processes}/${processDef.id}/updateBpmn`;
    return this.httpClient.fetch(url, options);
  }
}
