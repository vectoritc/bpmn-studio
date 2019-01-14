import {inject} from 'aurelia-framework';

import {IIdentity} from '@essential-projects/iam_contracts';
import {ActiveToken, FlowNodeRuntimeInformation} from '@process-engine/kpi_api_contracts';
import {IManagementApi, ProcessModelExecution} from '@process-engine/management_api_contracts';

import {IHeatmapRepository} from '../contracts/IHeatmap.Repository';

@inject('ManagementApiClientService')
export class HeatmapRepository implements IHeatmapRepository {

  private _managementApiClientService: IManagementApi;
  private _identity: IIdentity;

  constructor(managementApiClientService: IManagementApi) {
    this._managementApiClientService = managementApiClientService;
  }

  public getRuntimeInformationForProcessModel(processModelId: string): Promise<Array<FlowNodeRuntimeInformation>> {

    return this._managementApiClientService.getRuntimeInformationForProcessModel(this._identity, processModelId);
  }

  public getProcess(processModelId: string): Promise<ProcessModelExecution.ProcessModel> {

    return this._managementApiClientService.getProcessModelById(this._identity, processModelId);
  }

  public getActiveTokensForFlowNode(flowNodeId: string): Promise<Array<ActiveToken>> {

    return this._managementApiClientService.getActiveTokensForFlowNode(this._identity, flowNodeId);
  }

  public setIdentity(identity: IIdentity): void {
    this._identity = identity;
  }
}
