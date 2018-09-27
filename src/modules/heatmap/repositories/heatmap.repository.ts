import {inject} from 'aurelia-framework';

import {IIdentity} from '@essential-projects/iam_contracts';
import {ActiveToken, FlowNodeRuntimeInformation} from '@process-engine/kpi_api_contracts';
import {IManagementApi, ProcessModelExecution} from '@process-engine/management_api_contracts';

import {IAuthenticationService} from '../../../contracts';
import {IHeatmapRepository} from '../contracts/IHeatmap.Repository';

@inject('ManagementApiClientService', 'AuthenticationService')
export class HeatmapRepository implements IHeatmapRepository {

  private _managementApiClientService: IManagementApi;
  private _authenticationService: IAuthenticationService;

  constructor(managementApiClientService: IManagementApi, authenticationService: IAuthenticationService) {
    this._managementApiClientService = managementApiClientService;
    this._authenticationService = authenticationService;
  }

  public getRuntimeInformationForProcessModel(processModelId: string): Promise<Array<FlowNodeRuntimeInformation>> {
    const identity: IIdentity = this._getIdentity();

    return this._managementApiClientService.getRuntimeInformationForProcessModel(identity, processModelId);
  }

  public getProcess(processModelId: string): Promise<ProcessModelExecution.ProcessModel> {
    const identity: IIdentity = this._getIdentity();

    return this._managementApiClientService.getProcessModelById(identity, processModelId);
  }

  public getActiveTokensForFlowNode(flowNodeId: string): Promise<Array<ActiveToken>> {
    const identity: IIdentity = this._getIdentity();

    return this._managementApiClientService.getActiveTokensForFlowNode(identity, flowNodeId);
  }

  private _getIdentity(): IIdentity {
    const accessToken: string = this._authenticationService.getAccessToken();
    const identity: IIdentity = {
      token: accessToken,
    };

    return identity;
  }
}
