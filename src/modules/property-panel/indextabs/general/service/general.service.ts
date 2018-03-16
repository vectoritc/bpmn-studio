import {IPagination, IProcessDefEntity} from '@process-engine/bpmn-studio_client';
import {inject} from 'aurelia-framework';
import {GeneralRepository} from '../repository/general.repository';

@inject(GeneralRepository)
export class GeneralService {
  private generalRepository: GeneralRepository;

  constructor(generalRepository: GeneralRepository) {
    this.generalRepository = generalRepository;
  }

  public generateRandomId(): string {
    let randomId: string = '';
    const possible: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    const randomIdLength: number = 8;
    for (let i: number = 0; i < randomIdLength; i++) {
      randomId += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return randomId;
  }

  public getAllProcesses(): Promise<IPagination<IProcessDefEntity>> {
    return this.generalRepository.getAllProcesses();
  }

  public updateProcessDef(processDef: IProcessDefEntity, xml: string): Promise<any> {
    return this.generalRepository.updateProcessDef(processDef, xml);
  }

}
