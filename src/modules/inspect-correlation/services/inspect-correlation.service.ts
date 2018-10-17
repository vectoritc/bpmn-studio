import {inject} from 'aurelia-framework';

import {Correlation, LogEntry, TokenHistoryEntry} from '@process-engine/management_api_contracts';

import {IInspectCorrelationRepository, IInspectCorrelationService, ITokenEntry} from '../contracts';

@inject('InspectCorrelationRepository')
export class InspectCorrelationService implements IInspectCorrelationService {
  private _inspectCorrelationRepository: IInspectCorrelationRepository;

  constructor(inspectCorrelationRepository: IInspectCorrelationRepository) {
    this._inspectCorrelationRepository = inspectCorrelationRepository;
  }

  public getAllCorrelationsForProcessModelId(processModelId: string): Promise<Array<Correlation>> {
    return this._inspectCorrelationRepository.getAllCorrelationsForProcessModelId(processModelId);
  }

  public getLogsForCorrelation(correlation: Correlation): Promise<Array<LogEntry>> {
    return this._inspectCorrelationRepository.getLogsForCorrelation(correlation);
  }

  public async getTokenForFlowNodeInstance(processModelId: string, correlationId: string, flowNodeId: string): Promise<Array<TokenHistoryEntry>> {
    try {
      return await this._inspectCorrelationRepository.getTokenForFlowNodeInstance(processModelId, correlationId, flowNodeId);
    } catch (error) {
      return undefined;
    }
  }
}
