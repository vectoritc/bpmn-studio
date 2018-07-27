import {inject} from 'aurelia-framework';

import {IManagementApiService} from '@process-engine/management_api_contracts';

@inject('SolutionExplorerServiceManagementApi')
export class GeneralRepository {
  private _managementClient: IManagementApiService;

  constructor(managementClient: IManagementApiService) {
    this._managementClient = managementClient;
  }

  public async getAllProcesses():  ;
}
