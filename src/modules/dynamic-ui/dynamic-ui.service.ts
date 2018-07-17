import {BpmnStudioClient, IUserTaskConfig, UserTaskProceedAction} from '@process-engine/bpmn-studio_client';
import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {IDynamicUiService} from '../../contracts';

@inject(EventAggregator, 'BpmnStudioClient')
export class DynamicUiService implements IDynamicUiService {

  private _bpmnStudioClient: BpmnStudioClient;
  private _eventAggregator: EventAggregator;

  constructor(eventAggregator: EventAggregator, bpmnStudioClient: BpmnStudioClient) {
    this._bpmnStudioClient = bpmnStudioClient;
    this._eventAggregator = eventAggregator;
    this._bpmnStudioClient.on('renderUserTask', (userTaskConfig: IUserTaskConfig) => {
      this._eventAggregator.publish('render-dynamic-ui', userTaskConfig);
    });
    this._bpmnStudioClient.on('processEnd', (message: string) => {
      this._eventAggregator.publish('closed-process', message);
    });
  }

  public sendProceedAction(action: UserTaskProceedAction, userTaskConfig: IUserTaskConfig): void {
    this._bpmnStudioClient.proceedUserTask(userTaskConfig, action);
  }

  public getUserTaskConfig(userTaskId: string): Promise<IUserTaskConfig> {
    return this._bpmnStudioClient.getUserTaskConfig(userTaskId);
  }
}
