import {ConsumerClient, IPagination, IProcessDefEntity} from '@process-engine/consumer_client';
import {inject} from 'aurelia-framework';

@inject('ConsumerClient')
export class GeneralRepository {
  private consumerClient: ConsumerClient;

  constructor(consumerClient: ConsumerClient) {
    this.consumerClient = consumerClient;
  }

  public async getAllProcesses(): Promise<IPagination<IProcessDefEntity>> {
    const processes: IPagination<IProcessDefEntity> = await this.consumerClient.getProcessDefList();
    return processes;
  }
}
