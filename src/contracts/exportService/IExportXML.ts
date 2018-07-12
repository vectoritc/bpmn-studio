import {IExporter} from './index';

export interface IExportXML {
  /**
   * Creates a BPMN XML from the current loaded xml.
   *
   * @returns a reference to the services instance.
   */
  asBpmn(): IExporter;
}
