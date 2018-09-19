import {inject} from 'aurelia-framework';

import {Correlation} from '@process-engine/management_api_contracts';

import {LogEntry} from '@process-engine/logging_api_contracts';
import {IInspectCorrelationRepository, IInspectCorrelationService} from '../contracts';

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

  public getTokenForCorrelation(correlation: Correlation): Promise<string> {
    return this._inspectCorrelationRepository.getTokenForCorrelation(correlation);
  }
}
