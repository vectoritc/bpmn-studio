
import {inject} from 'aurelia-framework';

import {IIdentity} from '@essential-projects/iam_contracts';
import {LogEntry} from '@process-engine/logging_api_contracts';
import {Correlation, CorrelationProcessModel, IManagementApi} from '@process-engine/management_api_contracts';

import {IAuthenticationService} from '../../../contracts';
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
        const isSearchedProcessModel: boolean = processModel.name === processModelId;

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
      const logsForProcessModel: Array<LogEntry> = await this._managementApiService.getProcessModelLog(identity, processModel.name);

      logsForAllProcessModelsOfCorrelation.push(logsForProcessModel);
    }

    const logsForCorrelation: Array<LogEntry> = [].concat(...logsForAllProcessModelsOfCorrelation);

    return logsForCorrelation;
  }

  public async getTokenForCorrelation(correlation: Correlation): Promise<string> {
    const token: string = '{' +
    '"history":{"StartEvent":{},' +
    '"ut_WaehleKlasse":{ "form_fields":{"category":"Kleinwagen","isOneWay":"false","currency":"EUR"}},' +
    '"ut_WaehleExtras":{"form_fields":{"navigationSystem":"true","additionalDriver":"true","leather":"true"}},' +
    '"UserTask_Luxus":{"form_fields":{"chauffeur":"true"}},' +
    '"ut_WaehleKlasse2":{ "form_fields":{"category":"Kleinwagen","isOneWay":"false","currency":"EUR"}},' +
    '"ut_WaehleExtras2":{"form_fields":{"navigationSystem":"true","additionalDriver":"true","leather":"true"}},' +
    '"UserTask_Luxus2":{"form_fields":{"chauffeur":"true"}},' +
    '"ut_WaehleKlasse3":{ "form_fields":{"category":"Kleinwagen","isOneWay":"false","currency":"EUR"}},' +
    '"ut_WaehleExtras3":{"form_fields":{"navigationSystem":"true","additionalDriver":"true","leather":"true"}},' +
    '"UserTask_Luxus3":{"form_fields":{"chauffeur":"true"}},' +
    '"ut_WaehleKlasse4":{ "form_fields":{"category":"Kleinwagen","isOneWay":"false","currency":"EUR"}},' +
    '"ut_WaehleExtras4":{"form_fields":{"navigationSystem":"true","additionalDriver":"true","leather":"true"}},' +
    '"UserTask_Luxus4":{"form_fields":{"chauffeur":"true"}},' +
    '"ut_WaehleKlasse5":{ "form_fields":{"category":"Kleinwagen","isOneWay":"false","currency":"EUR"}},' +
    '"ut_WaehleExtras5":{"form_fields":{"navigationSystem":"true","additionalDriver":"true","leather":"true"}},' +
    '"UserTask_Luxus5":{"form_fields":{"chauffeur":"true"}},' +
    '"ut_WaehleKlasse6":{ "form_fields":{"category":"Kleinwagen","isOneWay":"false","currency":"EUR"}},' +
    '"ut_WaehleExtras6":{"form_fields":{"navigationSystem":"true","additionalDriver":"true","leather":"true"}},' +
    '"UserTask_Luxus6":{"form_fields":{"chauffeur":"true"}},' +
    '"ut_WaehleKlasse7":{ "form_fields":{"category":"Kleinwagen","isOneWay":"false","currency":"EUR"}},' +
    '"ut_WaehleExtras7":{"form_fields":{"navigationSystem":"true","additionalDriver":"true","leather":"true"}},' +
    '"UserTask_Luxus7":{"form_fields":{"chauffeur":"true"}},' +
    '"ut_WaehleKlasse8":{ "form_fields":{"category":"Kleinwagen","isOneWay":"false","currency":"EUR"}},' +
    '"ut_WaehleExtras8":{"form_fields":{"navigationSystem":"true","additionalDriver":"true","leather":"true"}},' +
    '"UserTask_Luxus8":{"form_fields":{"chauffeur":"true"}},' +
    '"ut_WaehleKlasse9":{ "form_fields":{"category":"Kleinwagen","isOneWay":"false","currency":"EUR"}},' +
    '"ut_WaehleExtras9":{"form_fields":{"navigationSystem":"true","additionalDriver":"true","leather":"true"}},' +
    '"UserTask_Luxus9":{"form_fields":{"chauffeur":"true"}},' +
    '"ut_WaehleKlasse10":{ "form_fields":{"category":"Kleinwagen","isOneWay":"false","currency":"EUR"}},' +
    '"ut_WaehleExtras10":{"form_fields":{"navigationSystem":"true","additionalDriver":"true","leather":"true"}},' +
    '"UserTask_Luxus10":{"form_fields":{"chauffeur":"true"}},' +
    '"current":{"form_fields":{"chauffeur":"true"}}}' +
    '}';

    const tokenPromise: Promise<string> =  new Promise((resolve: Function): void => {
      resolve(token);
    });

    return tokenPromise;
  }

  private _createIdentity(): IIdentity {
    const accessToken: string = this._authenticationService.getAccessToken();

    const identity: IIdentity = {
      token: accessToken,
    };

    return identity;
  }
}
