import {IExporter} from './index';

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
