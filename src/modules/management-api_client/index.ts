import {IHttpClient} from '@essential-projects/http_contracts';
import {ExternalAccessor, ManagementApiClientService} from '@process-engine/management_api_client';
import {FrameworkConfiguration} from 'aurelia-framework';

export async function configure(config: FrameworkConfiguration): Promise<void> {

  const httpClient: IHttpClient = config.container.get('HttpFetchClient');

  const clientService: ManagementApiClientService = createManagementApiClient(httpClient);

  config.container.registerInstance('ManagementApiClientService', clientService);
}

function createManagementApiClient(httpClient: IHttpClient): ManagementApiClientService {

  const externalAccessor: ExternalAccessor = new ExternalAccessor(httpClient);

  return new ManagementApiClientService(externalAccessor);
}
