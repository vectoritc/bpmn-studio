import {ExternalAccessor, ManagementApiClientService} from '@process-engine/management_api_client';
import {FrameworkConfiguration} from 'aurelia-framework';
import environment from '../../environment';

export async function configure(config: FrameworkConfiguration): Promise<void> {

  const clientService: ManagementApiClientService = createManagementApiClient();

  config.container.registerInstance('ManagementApiClientService', clientService);
}

function createManagementApiClient(): ManagementApiClientService {

  const httpClient: any = {
    post: async(url: string, payload: any, headers: any): Promise<any> => {

      const request: Request = new Request(`${environment.bpmnStudioClient.baseRoute}/${url}`, {
        method: 'POST',
        mode: 'cors',
        referrer: 'no-referrer',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          ...headers.headers,
        },
      });
      const response: Response = await fetch(request);
      return {
        result: response.json(),
        status: response.status,
      };
    },

    get: async(url: string, headers: any): Promise<any> => {

      const request: Request = new Request(`${environment.bpmnStudioClient.baseRoute}/${url}`, {
        method: 'GET',
        mode: 'cors',
        referrer: 'no-referrer',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          ...headers.headers,
        },
      });
      const response: Response = await fetch(request);
      return {
        result: response.json(),
        status: response.status,
      };
    },
  };
  const externalAccessor: ExternalAccessor = new ExternalAccessor(httpClient);

  return new ManagementApiClientService(externalAccessor);
}
