import {IDiagramValidationService, IDiagramValidator} from '../../contracts';
import {DiagramValidator} from './DiagramValidator';

export class DiagramValidationService implements IDiagramValidationService {

  public start(diagramXML: string): IDiagramValidator {
    return new DiagramValidator(this, diagramXML);
  }

  // Business Rules {{{
  public hasXMLFileSignature(content: string): Promise<boolean> {
    const xmlSignature: string = '<?xml ';
    const startsWithSignature: boolean = content.startsWith(xmlSignature);

    return Promise.resolve(startsWithSignature);
  }

  public containsBPMNDefinitions(content: string): Promise<boolean> {
    const bpmnDefinitions: string = 'bpmn:definitions';
    const containsBPMNDefinitions: boolean = content.indexOf(bpmnDefinitions) !== -1;

    return Promise.resolve(containsBPMNDefinitions);
  }
  // }}} Business Rules
}
