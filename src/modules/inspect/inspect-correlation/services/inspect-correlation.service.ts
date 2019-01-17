import {inject} from 'aurelia-framework';

import {DataModels} from '@process-engine/management_api_contracts';

import {IInspectCorrelationRepository, IInspectCorrelationService} from '../contracts';

@inject('InspectCorrelationRepository')
export class InspectCorrelationService implements IInspectCorrelationService {
  private _inspectCorrelationRepository: IInspectCorrelationRepository;

  constructor(inspectCorrelationRepository: IInspectCorrelationRepository) {
    this._inspectCorrelationRepository = inspectCorrelationRepository;
  }

  public getAllCorrelationsForProcessModelId(processModelId: string): Promise<Array<DataModels.Correlations.Correlation>> {
    return this._inspectCorrelationRepository.getAllCorrelationsForProcessModelId(processModelId);
  }

  public getLogsForCorrelation(correlation: DataModels.Correlations.Correlation): Promise<Array<DataModels.Logging.LogEntry>> {
    return this._inspectCorrelationRepository.getLogsForCorrelation(correlation);
  }

  public async getTokenForFlowNodeInstance(processModelId: string,
                                           correlationId: string,
                                           flowNodeId: string): Promise<Array<DataModels.TokenHistory.TokenHistoryEntry> | undefined> {
    try {
      return await this._inspectCorrelationRepository.getTokenForFlowNodeInstance(processModelId, correlationId, flowNodeId);
    } catch (error) {
      return undefined;
    }
  }
}
