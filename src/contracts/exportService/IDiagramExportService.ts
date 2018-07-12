export interface IExporter {
  /**
   * Exports the current diagram as the last defined format.
   *
   * @params filename Name of the file that will be exported.
   * @returns the exported diagram.
   */
  export(filename: string): Promise<void>;
}

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

export interface IExportXML {
    /**
     * Creates a BPMN XML from the current loaded xml.
     *
     * @returns a reference to the services instance.
     */
    asBpmn(): IExporter;
}

export interface IExportSVG {

  asSVG(): IExporter;

  /**
   * Creates a PNG from the current loaded svg.
   *
   * @returns a reference to the services instance.
   */
  asPNG(): IExporter;

  /**
   * Creates a JPEG from the current loaded svg.
   *
   * @returns a reference to the services instance
   */
  asJPEG(): IExporter;
}
