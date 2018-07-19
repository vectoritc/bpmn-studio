import {IDiagramValidator} from './index';

export interface IDiagramValidationService {

  /**
   * Starts the validation of a xml string.
   *
   * @param xml the xml to be validated.
   * @returns A fluent API to chain validations.
   */
  validate(xml: string): IDiagramValidator;
}
