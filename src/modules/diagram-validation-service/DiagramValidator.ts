import {IDiagramValidator} from '../../contracts';
import {DiagramValidationService} from './DiagramValidationService';

export class DiagramValidator implements IDiagramValidator {

  private _service: DiagramValidationService;
  private _diagramXML: string;
  private _validations: Array<Promise<void>> = [];

  constructor(service: DiagramValidationService, diagramXML: string) {
    this._service = service;
    this._diagramXML = diagramXML;
  }

  public isXML(): IDiagramValidator {
    const hasXMLFileSignature: Promise<boolean> = this._service.hasXMLFileSignature(this._diagramXML);

    const isXMLPromises: Array<Promise<boolean>> = [
      hasXMLFileSignature,
    ];

    const flatterned: Promise<void> = this._throwOnFalselyPromise(isXMLPromises, 'Diagram is not a valid XML file.');
    this._validations.push(flatterned);

    return this;
  }

  public isBPMN(): IDiagramValidator {
    const containsBPMNDefinitions: Promise<boolean> = this._service.containsBPMNDefinitions(this._diagramXML);

    const iisBPMNPromises: Array<Promise<boolean>> = [
      containsBPMNDefinitions,
    ];

    const flatterned: Promise<void> = this._throwOnFalselyPromise(iisBPMNPromises, 'Diagram is not a valid BPMN file.');
    this._validations.push(flatterned);

    return this;
  }

  public async throwIfError(): Promise<void> {
    /*
    * We dont use `await Promise.all(this._validations);` here,
    * because we want to await the promises in order.
    *
    * Also .forEach is not possible because of await.
    */
    for (const validation of this._validations) {
      await validation;
    }
  }

  /**
   * Converts the given promise array into single promise. The new promise will
   * resolve, if all given promises returned true. It will reject with the given
   * error message, if any of the promises returned false.
   *
   * @param promises the promise array to converted.
   * @param errorMessage the message of the error thrown on falsely promise.
   */
  private _throwOnFalselyPromise(promises: Array<Promise<boolean>>, errorMessage: string): Promise<void> {
    const allPromise: Promise<Array<boolean>> = Promise.all(promises);

    const flatterned: Promise<void> = allPromise
      .then((promiseResults: Array<boolean>): void => {
        const containsFalse: boolean = promiseResults.indexOf(false) !== -1;
        if (containsFalse) {
          throw new Error(errorMessage);
        }
      });

    return flatterned;
  }
}
