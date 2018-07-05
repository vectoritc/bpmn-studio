export interface IDiagramPrintService {
  printDiagram(svgContent?: string): Promise<void>;
}
