export interface IDiagramExportService {
  /**
   * Exports the current diagram as the last defined format.
   *
   * @params filename Name of the file that will be exported.
   * @returns the exported diagram.
   */
  export(filename: string): Promise<void>;

  /**
   * Load a new XML into the service.
   *
   * @param xmlContent Content of the xml, that should be loaded.
   */
  loadXML(xmlContent: string): IDiagramExportService;

  /**
   * Load a new SVG into the service.
   *
   * @param svgContent Content of the new SVG, that should be loaded.
   */
  loadSVG(svgContent: string): IDiagramExportService;

  /**
   * Creates a BPMN XML from the current loaded xml.
   *
   * @returns a reference to the services instance.
   */
  asBpmn(): IDiagramExportService;

  /**
   * Creates a SVG from the current loaded svg.
   *
   * @returns a reference to the services instance.
   */
  asSVG(): IDiagramExportService;

  /**
   * Creates a PNG from the current loaded svg.
   *
   * @returns a reference to the services instance.
   */
  asPNG(): IDiagramExportService;

  /**
   * Creates a JPEG from the current loaded svg.
   *
   * @returns a reference to the services instance
   */
  asJPEG(): IDiagramExportService;
}
