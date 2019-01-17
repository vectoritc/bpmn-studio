
import {inject} from 'aurelia-framework';

import {IIdentity} from '@essential-projects/iam_contracts';
import {DataModels, IManagementApi} from '@process-engine/management_api_contracts';

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

  public async getAllCorrelationsForProcessModelId(processModelId: string): Promise<Array<DataModels.Correlations.Correlation>> {
    const identity: IIdentity = this._createIdentity();

    const allCorrelations: Array<DataModels.Correlations.Correlation> = await this._managementApiService.getAllCorrelations(identity);

    const correlationsForProcessModelId: Array<DataModels.Correlations.Correlation> =
      allCorrelations.filter((correlation: DataModels.Correlations.Correlation) => {

        const processModelWithSameId: DataModels.Correlations.CorrelationProcessModel =
          correlation.processModels.find((processModel: DataModels.Correlations.CorrelationProcessModel) => {
            const isSearchedProcessModel: boolean = processModel.processModelId === processModelId;

            return isSearchedProcessModel;
          });

        const processModelFound: boolean = processModelWithSameId !== undefined;

        return processModelFound;
      });

    return correlationsForProcessModelId;
  }

  public async getLogsForCorrelation(correlation: DataModels.Correlations.Correlation): Promise<Array<DataModels.Logging.LogEntry>> {
    const identity: IIdentity = this._createIdentity();

    const logsForAllProcessModelsOfCorrelation: Array<Array<DataModels.Logging.LogEntry>> = [];

    for (const processModel of correlation.processModels) {
      const logsForProcessModel: Array<DataModels.Logging.LogEntry> = await this._managementApiService
        .getProcessModelLog(
          identity,
          processModel.processModelId,
          correlation.id);

      logsForAllProcessModelsOfCorrelation.push(logsForProcessModel);
    }

    const logsForCorrelation: Array<DataModels.Logging.LogEntry> = [].concat(...logsForAllProcessModelsOfCorrelation);

    return logsForCorrelation;
  }

  public async getTokenForFlowNodeInstance(
    processModelId: string,
    correlationId: string,
    flowNodeId: string,
  ): Promise<Array<DataModels.TokenHistory.TokenHistoryEntry>> {
    const identity: IIdentity = this._createIdentity();

    return this._managementApiService.getTokensForFlowNodeInstance(identity, correlationId, processModelId, flowNodeId);
  }

  private _createIdentity(): IIdentity {
    const accessToken: string = this._authenticationService.getAccessToken();

    // TODO: Get the identity from the IdentityService of `@process-engine/iam`
    const identity: IIdentity = {
      token: accessToken,
      userId: '', // Provided by the IdentityService.
    };

    return identity;
  }
}
