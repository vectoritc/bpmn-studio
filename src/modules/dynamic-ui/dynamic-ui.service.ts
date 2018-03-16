import {BpmnStudioClient, IUserTaskConfig, UserTaskProceedAction} from '@process-engine/consumer_client';
import {IUserTaskEntity, IUserTaskMessageData} from '@process-engine/process_engine_contracts';
import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {IDynamicUiService} from '../../contracts';
import environment from '../../environment';

@inject(EventAggregator, 'BpmnStudioClient')
export class DynamicUiService implements IDynamicUiService {

  private bpmnStudioClient: BpmnStudioClient;
  private eventAggregator: EventAggregator;

  constructor(eventAggregator: EventAggregator, bpmnStudioClient: BpmnStudioClient) {
    this.bpmnStudioClient = bpmnStudioClient;
    this.eventAggregator = eventAggregator;
    this.bpmnStudioClient.on('renderUserTask', (userTaskConfig: IUserTaskConfig) => {
      this.eventAggregator.publish('render-dynamic-ui', userTaskConfig);
    });
    this.bpmnStudioClient.on('processEnd', (message: any) => {
      this.eventAggregator.publish('closed-process', message);
    });
  }

  public sendProceedAction(action: UserTaskProceedAction, userTaskConfig: IUserTaskConfig): void {
    this.bpmnStudioClient.proceedUserTask(userTaskConfig, action);
  }

  public getUserTaskConfig(userTaskId: string): Promise<IUserTaskConfig> {
    return this.bpmnStudioClient.getUserTaskConfig(userTaskId);
  }
}
