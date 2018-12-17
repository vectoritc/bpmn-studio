
import {inject} from 'aurelia-framework';

import {IIdentity} from '@essential-projects/iam_contracts';
import {Correlation, CorrelationProcessModel, IManagementApi, LogEntry, TokenHistoryEntry} from '@process-engine/management_api_contracts';

import {IAuthenticationService} from '../../../../contracts';
import {IInspectCorrelationRepository} from '../contracts';

@inject('ManagementApiClientService', 'AuthenticationService')
export class InspectCorrelationRepository implements IInspectCorrelationRepository {

  private _managementApiService: IManagementApi;
  private _authenticationService: IAuthenticationService;

  constructor(managementApi: IManagementApi, authenticationService: IAuthenticationService) {
    this._managementApiService = managementApi;
    this._authenticationService = authenticationService;
  }

  public async getAllCorrelationsForProcessModelId(processModelId: string): Promise<Array<Correlation>> {
    const identity: IIdentity = this._createIdentity();

    const allCorrelations: Array<Correlation> = await this._managementApiService.getAllCorrelations(identity);

    const correlationsForProcessModelId: Array<Correlation> = allCorrelations.filter((correlation: Correlation) => {
      const processModelWithSameId: CorrelationProcessModel = correlation.processModels.find((processModel: CorrelationProcessModel) => {
        const isSearchedProcessModel: boolean = processModel.processModelId === processModelId;

        return isSearchedProcessModel;
      });

      const processModelFound: boolean = processModelWithSameId !== undefined;

      return processModelFound;
    });

    return correlationsForProcessModelId;
  }

  public async getLogsForCorrelation(correlation: Correlation): Promise<Array<LogEntry>> {
    const identity: IIdentity = this._createIdentity();

    const logsForAllProcessModelsOfCorrelation: Array<Array<LogEntry>> = [];

    for (const processModel of correlation.processModels) {
      const logsForProcessModel: Array<LogEntry> = await this._managementApiService.getProcessModelLog(identity, processModel.processModelId
        , correlation.id);

      logsForAllProcessModelsOfCorrelation.push(logsForProcessModel);
    }

    const logsForCorrelation: Array<LogEntry> = [].concat(...logsForAllProcessModelsOfCorrelation);

    return logsForCorrelation;
  }

  public async getTokenForFlowNodeInstance(processModelId: string, correlationId: string, flowNodeId: string): Promise<Array<TokenHistoryEntry>> {
    const identity: IIdentity = this._createIdentity();

    return this._managementApiService.getTokensForFlowNodeInstance(identity, correlationId, processModelId, flowNodeId);
  }

  private _createIdentity(): IIdentity {
    const accessToken: string = this._authenticationService.getAccessToken();

    const identity: IIdentity = {
      token: accessToken,
    };

    return identity;
  }
}
