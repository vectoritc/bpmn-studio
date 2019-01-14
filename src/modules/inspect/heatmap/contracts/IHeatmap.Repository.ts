import {IIdentity} from '@essential-projects/iam_contracts';
import {ActiveToken, FlowNodeRuntimeInformation} from '@process-engine/kpi_api_contracts';
import {ProcessModelExecution} from '@process-engine/management_api_contracts';

export interface IHeatmapRepository {
  getRuntimeInformationForProcessModel(processModelId: string): Promise<Array<FlowNodeRuntimeInformation>>;
  getProcess(processModelId: string): Promise<ProcessModelExecution.ProcessModel>;
  getActiveTokensForFlowNode(flowNodeId: string): Promise<Array<ActiveToken>>;
  setIdentity(identity: IIdentity): void;
}
