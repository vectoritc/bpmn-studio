import {Correlation, LogEntry, TokenHistoryEntry} from '@process-engine/management_api_contracts';

export interface IInspectCorrelationService {
  getAllCorrelationsForProcessModelId(processModelId: string): Promise<Array<Correlation>>;
  getLogsForCorrelation(correlation: Correlation): Promise<Array<LogEntry>>;
  getTokenForFlowNodeInstance(processModelId: string, correlationId: string, flowNodeId: string): Promise<Array<TokenHistoryEntry>>;
}
