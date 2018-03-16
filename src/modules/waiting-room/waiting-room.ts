import {BpmnStudioClient, IUserTaskConfig} from '@process-engine/consumer_client';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import * as toastr from 'toastr';

@inject(Router, 'BpmnStudioClient')
export class WaitingRoom {

  private router: Router;
  private bpmnStudioClient: BpmnStudioClient;
  private processInstanceId: string;

  constructor(router: Router, bpmnStudioClient: BpmnStudioClient) {
    this.router = router;
    this.bpmnStudioClient = bpmnStudioClient;
  }

  private renderUserTaskCallback: any = (userTaskConfig: IUserTaskConfig): void => {
    toastr.success('Process continued');
    if (userTaskConfig.userTaskEntity.process.id === this.processInstanceId) {
      this.router.navigate(`/task/${userTaskConfig.id}/dynamic-ui`);
      this.bpmnStudioClient.off('renderUserTask', this.renderUserTaskCallback);
    }
  }

  private processEndCallback: any = (processInstanceId: string): void => {
    toastr.warning('Process stopped');
    if (processInstanceId === this.processInstanceId) {
      this.router.navigate('task');
      this.bpmnStudioClient.off('processEnd', this.processEndCallback);
    }
  }

  public activate(routeParameters: {processInstanceId: string}): void {
    this.processInstanceId = routeParameters.processInstanceId;

    this.bpmnStudioClient.on('processEnd', this.processEndCallback);
    this.bpmnStudioClient.on('renderUserTask', this.renderUserTaskCallback);
  }

  public navigateToTaskList(): void {
    this.router.navigate('task');
    this.bpmnStudioClient.off('processEnd', this.processEndCallback);
    this.bpmnStudioClient.off('renderUserTask', this.renderUserTaskCallback);
  }
}
