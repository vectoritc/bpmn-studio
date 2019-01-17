import {DataModels} from '@process-engine/management_api_contracts';

export interface IInspectCorrelationRepository {
  getAllCorrelationsForProcessModelId(processModelId: string): Promise<Array<DataModels.Correlations.Correlation>>;
  getLogsForCorrelation(correlation: DataModels.Correlations.Correlation): Promise<Array<DataModels.Logging.LogEntry>>;
  getTokenForFlowNodeInstance(
    processModelId: string,
    correlationId: string,
    flowNodeId: string,
  ): Promise<Array<DataModels.TokenHistory.TokenHistoryEntry>>;
}
