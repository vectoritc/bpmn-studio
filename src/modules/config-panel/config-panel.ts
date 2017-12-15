import {ConsumerClient, IUserTaskConfig} from '@process-engine/consumer_client';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import environment from '../../environment';

@inject(Router, 'ConsumerClient')
export class ConfigPanel {

  private router: Router;
  private consumerClient: ConsumerClient;

  public config: any = environment.consumerClient;

  constructor(router: Router, consumerClient: ConsumerClient) {
    this.router = router;
    this.consumerClient = consumerClient;
    this.config.baseRoute = environment.consumerClient.baseRoute;
  }

  public updateSettings(): void {
    environment.consumerClient.baseRoute = this.config.baseRoute;
    window.localStorage.setItem('baseRoute', this.config.baseRoute);
    this.consumerClient.updateConfig(this.config);
  }

  public getSettings(): void {

  }

}
