import {LogEntry} from '@process-engine/logging_api_contracts';
import {Correlation} from '@process-engine/management_api_contracts';

export interface IInspectCorrelationService {
  getAllCorrelationsForProcessModelId(processModelId: string): Promise<Array<Correlation>>;
  getLogsForCorrelation(correlation: Correlation): Promise<Array<LogEntry>>;
  getTokenForCorrelation(correlation: Correlation): Promise<string>;
}
