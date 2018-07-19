import {
  IDiagramValidationRules,
  IDiagramValidationService,
  IDiagramValidator,
} from '../../contracts';
import {DiagramValidator} from './DiagramValidator';

export class DiagramValidationService implements IDiagramValidationService {

  private _rules: IDiagramValidationRules = {
    isXML: {
      rules: [
        this._hasXMLFileSignature,
      ],
      errorMessage: 'Diagram is not a valid XML file.',
    },
    isBPMN: {
      rules: [
        this._containsBPMNDefinitions,
      ],
      errorMessage: 'Diagram is not a valid BPMN file.',
    },
  };

  public validate(diagramXML: string): IDiagramValidator {
    return new DiagramValidator(this._rules, diagramXML);
  }

  // Business Rules {{{
  private _hasXMLFileSignature(content: string): Promise<boolean> {
    const xmlSignature: string = '<?xml ';
    const startsWithSignature: boolean = content.startsWith(xmlSignature);

    // return Promise.resolve(startsWithSignature);

    return Promise.reject(new Error('lol'));
  }

  private _containsBPMNDefinitions(content: string): Promise<boolean> {
    const bpmnDefinitions: string = 'bpmn:definitions';
    const containsBPMNDefinitions: boolean = content.indexOf(bpmnDefinitions) !== -1;

    return Promise.resolve(containsBPMNDefinitions);
  }
  // }}} Business Rules
}
