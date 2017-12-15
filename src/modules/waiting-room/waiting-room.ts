import {ConsumerClient, IUserTaskConfig} from '@process-engine/consumer_client';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import * as toastr from 'toastr';

@inject(Router, 'ConsumerClient')
export class WaitingRoom {

  private router: Router;
  private consumerClient: ConsumerClient;
  private processInstanceId: string;

  constructor(router: Router, consumerClient: ConsumerClient) {
    this.router = router;
    this.consumerClient = consumerClient;
  }

  private renderUserTaskCallback: any = (userTaskConfig: IUserTaskConfig): void => {
    toastr.success('Prozess fortgesetzt');
    if (userTaskConfig.userTaskEntity.process.id === this.processInstanceId) {
      this.router.navigate(`/task/${userTaskConfig.id}/dynamic-ui`);
      this.consumerClient.off('renderUserTask', this.renderUserTaskCallback);
    }
  }

  private processEndCallback: any = (processInstanceId: string): void => {
    toastr.warning('Prozess beendet');
    if (processInstanceId === this.processInstanceId) {
      this.router.navigate('task');
      this.consumerClient.off('processEnd', this.processEndCallback);
    }
  }

  public activate(routeParameters: {processInstanceId: string}): void {
    this.processInstanceId = routeParameters.processInstanceId;

    this.consumerClient.on('processEnd', this.processEndCallback);
    this.consumerClient.on('renderUserTask', this.renderUserTaskCallback);
  }

  public navigateToTaskList(): void {
    this.router.navigate('task');
    this.consumerClient.off('processEnd', this.processEndCallback);
    this.consumerClient.off('renderUserTask', this.renderUserTaskCallback);
  }
}
