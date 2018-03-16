import {BpmnStudioClient, IUserTaskConfig} from '@process-engine/consumer_client';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import * as toastr from 'toastr';
import environment from '../../environment';

@inject(Router, 'BpmnStudioClient')
export class ConfigPanel {

  private router: Router;
  private bpmnStudioClient: BpmnStudioClient;

  public config: any = environment.bpmnStudioClient;

  constructor(router: Router, bpmnStudioClient: BpmnStudioClient) {
    this.router = router;
    this.bpmnStudioClient = bpmnStudioClient;
    this.config.baseRoute = environment.bpmnStudioClient.baseRoute;
  }

  public updateSettings(): void {
    environment.bpmnStudioClient.baseRoute = this.config.baseRoute;
    window.localStorage.setItem('baseRoute', this.config.baseRoute);
    environment.processengine.routes.processes = `${this.config.baseRoute}/datastore/ProcessDef`;
    environment.processengine.routes.iam = `${this.config.baseRoute}/iam`;
    environment.processengine.routes.messageBus = `${this.config.baseRoute}/mb`;
    environment.processengine.routes.processInstances = `${this.config.baseRoute}/datastore/Process`;
    environment.processengine.routes.startProcess = `${this.config.baseRoute}/processengine/start`;
    environment.processengine.routes.userTasks =  `${this.config.baseRoute}/datastore/UserTask`;
    this.bpmnStudioClient.updateConfig(this.config);
    toastr.success('Sucessfully saved settings!');
    this.router.navigate('');
  }

  public cancelUpdate(): void {
    toastr.warning('Settings dismissed!');
    this.router.navigate('');
  }

}
