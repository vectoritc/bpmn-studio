import {IProcessDefEntity} from '../processengine';

export interface IPrintService {
  printDiagram(): Promise<void>;
}
