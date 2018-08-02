import {IDiagram, ISolution} from '@process-engine/solutionexplorer.contracts';
import {IDiagramCreationService} from '../../contracts';

export class DiagramCreationService implements IDiagramCreationService {

  public createNewDiagram(insideSolution: ISolution, withName: string): IDiagram {

    const processModelId: string = withName.trim();
    const processModelIdIsEmpty: boolean = processModelId.length === 0;

    if (processModelIdIsEmpty) {
      throw new Error('Empty process model name not allowed.');
    }

    const diagramUri: string = `${insideSolution.uri}/${processModelId}.bpmn`;

    const foundDiagram: IDiagram = this
      ._findURIObject(insideSolution.diagrams, diagramUri);

    const diagramWithIdAlreadyExists: boolean = foundDiagram !== undefined;

    if (diagramWithIdAlreadyExists) {
      throw new Error('A diagram with that name already exists.');
    }

    const processXML: string = this._getInitialProcessXML(processModelId);

    const diagram: IDiagram = {
      id: processModelId,
      name: processModelId,
      uri: diagramUri,
      xml: processXML,
    };

    return diagram;
  }

  private _getInitialProcessXML(processModelId: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <bpmn:definitions
      xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
      xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
      xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
      xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      id="Definition_1"
      targetNamespace="http://bpmn.io/schema/bpmn"
      exporter="BPMN Studio"
      exporterVersion="1">
        <bpmn:collaboration id="Collaboration_1cidyxu" name="">
            <bpmn:participant id="Participant_0px403d" name="${processModelId}" processRef="${processModelId}" />
        </bpmn:collaboration>
        <bpmn:process id="${processModelId}" name="${processModelId}" isExecutable="false">
            <bpmn:extensionElements>
                <camunda:executionListener class="" event="" />
                <camunda:properties />
                <camunda:properties />
            </bpmn:extensionElements>
            <bpmn:laneSet>
                <bpmn:lane id="Lane_1xzf0d3" name="Lane" />
            </bpmn:laneSet>
        </bpmn:process>
        <bpmndi:BPMNDiagram id="BPMNDiagram_1">
            <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_1cidyxu">
                <bpmndi:BPMNShape id="Participant_0px403d_di" bpmnElement="Participant_0px403d">
                    <dc:Bounds x="5" y="4" width="581" height="170" />
                </bpmndi:BPMNShape>
                <bpmndi:BPMNShape id="Lane_1xzf0d3_di" bpmnElement="Lane_1xzf0d3">
                    <dc:Bounds x="35" y="4" width="551" height="170" />
                </bpmndi:BPMNShape>
            </bpmndi:BPMNPlane>
        </bpmndi:BPMNDiagram>
    </bpmn:definitions>`;
  }

  private _findURIObject<T extends {uri: string}>(objects: Array<T>, targetURI: string): T {
    const foundObject: T = objects.find((object: T): boolean => {
      return object.uri.toLowerCase() === targetURI.toLowerCase();
    });

    return foundObject;
  }
}
