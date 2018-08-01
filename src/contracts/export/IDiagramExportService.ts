export interface IDiagramExportService {
  exportBPMN(xml: string): Promise<string>;
  exportSVG(svg: string): Promise<string>;
  exportPNG(svg: string): Promise<string>;
  exportJPEG(svg: string): Promise<string>;
}
