import {ConsumerClient, IUserTaskConfig} from '@process-engine/consumer_client';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import * as toastr from 'toastr';

@inject(Router, 'ConsumerClient')
export class ConfigPanel {

  private router: Router;
  private consumerClient: ConsumerClient;

  constructor(router: Router, consumerClient: ConsumerClient) {
    this.router = router;
    this.consumerClient = consumerClient;
  }

}
