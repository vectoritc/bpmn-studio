import {ConsumerClient, IPagination, IProcessDefEntity} from '@process-engine/consumer_client';
import {HttpClient} from 'aurelia-fetch-client';
import {inject} from 'aurelia-framework';
import environment from '../../../../../environment';

@inject('ConsumerClient', HttpClient)
export class GeneralRepository {
  private consumerClient: ConsumerClient;
  private httpClient: HttpClient;

  constructor(consumerClient: ConsumerClient, httpClient: HttpClient) {
    this.consumerClient = consumerClient;
    this.httpClient = httpClient;
  }

  public async getAllProcesses(): Promise<IPagination<IProcessDefEntity>> {
    const processes: IPagination<IProcessDefEntity> = await this.consumerClient.getProcessDefList();
    return processes;
  }

  public async updateProcessDef(processDef: IProcessDefEntity, xml: string): Promise<any> {

    let updateError: Error;
    let result: any;

    try {
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
      result = await this.httpClient.fetch(url, options);

    } catch (error) {
      updateError = error;
    }

    if (updateError) {
      throw updateError;
    }
    return result;
  }
}
