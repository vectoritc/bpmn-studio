import {IDiagramExportService, ISvgConvertService, IXmlConvertService} from '../../../contracts/index';
import {DiagramSvgConverter} from './diagram.svg.converter';
import {DiagramXmlConverter} from './diagram.xml.converter';

export class DiagramExportService implements IDiagramExportService {
  public loadXML(xml: string): IXmlConvertService {
    console.log('xml exporter');
    return new DiagramXmlConverter(xml);
  }

  public loadSVG(svg: string): ISvgConvertService {
    return new DiagramSvgConverter(svg);
  }
}
