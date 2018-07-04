import {IProcessDefEntity} from '../processengine';

export interface IDiagramExportService {
  exportBPMN(process: IProcessDefEntity): Promise<void>;
  exportSVG(process: IProcessDefEntity): Promise<void>;
  exportPNG(process: IProcessDefEntity): Promise<void>;
  exportJPEG(process: IProcessDefEntity): Promise<void>;
  getXML(): Promise<string>;
  getSVG(): Promise<string>;
}
