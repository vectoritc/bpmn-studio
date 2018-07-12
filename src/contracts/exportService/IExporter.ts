export interface IExporter {
  /**
   * Exports the current diagram as the last defined format.
   *
   * @params filename Name of the file that will be exported.
   * @returns the exported diagram.
   */
  export(filename: string): Promise<void>;
}
