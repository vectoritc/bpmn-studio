import {IExportSVG, IExportXML} from './index';
export interface IDiagramExportService {
  /**
   * Load a new XML into the service.
   *
   * @param xmlContent Content of the xml, that should be loaded.
   */
  loadXML(xmlContent: string): IExportXML;

  /**
   * Load a new SVG into the service.
   *
   * @param svgContent Content of the new SVG, that should be loaded.
   */
  loadSVG(svgContent: string): IExportSVG;
}
