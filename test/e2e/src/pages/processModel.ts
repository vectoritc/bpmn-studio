import {browser} from 'protractor';
import {HttpClient} from 'protractor-http-client';

export class ProcessModel {
  // Define Instances
  private _processEngineUrl: string = browser.params.processEngineUrl;
  private _http: HttpClient = new HttpClient(this._processEngineUrl);

  // Define Links, Urls, Classes
  public processModelLink: string = '/processdef';
  // tslint:disable-next-line:no-magic-numbers
  public processModelID: string = 'TA_' + Math.floor(Math.random() * 1000000);

  // Define Class method call forwarding

  // Define Elements

  // Define Functions
  public processModelUrl(processModel: string): string {
    return 'processdef/' + processModel + '/detail';
  }

  public postProcessModel(processModel?: string): void {
    let currentModel: string = this.processModelID;
    if (processModel !== undefined) {
      currentModel = processModel;
    }

    this._http.post('/api/management/v1/process_models/' + currentModel + '/update', {
      xml: '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<bpmn:definitions xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" ' +
           'xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:dc=\"http://www.omg.org/spec/DD/20100524/DC\" ' +
           'xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:di=\"http://www.omg.org/spec/DD/20100524/DI\" ' +
           'id=\"Definition_1\" targetNamespace=\"http://bpmn.io/schema/bpmn\" exporter=\"BPMN Studio\" exporterVersion=\"1\">' +
           '<bpmn:collaboration id=\"Collaboration_1cidyxu\" name=\"\"><bpmn:participant id=\"Participant_0px403d\" name=\"' +
           currentModel + '\" processRef=\"' + currentModel + '\" /></bpmn:collaboration><bpmn:process id=\"' + currentModel +
           '\" name=\"' + currentModel + '\" isExecutable=\"true\"><bpmn:laneSet><bpmn:lane id=\"Lane_1xzf0d3\" name=\"Lane\">' +
           '<bpmn:flowNodeRef>StartEvent_1mox3jl</bpmn:flowNodeRef><bpmn:flowNodeRef>EndEvent_0eie6q6</bpmn:flowNodeRef>' +
           '<bpmn:flowNodeRef>Task_0z3p6gi</bpmn:flowNodeRef></bpmn:lane></bpmn:laneSet><bpmn:startEvent id=\"StartEvent_1mox3jl\"' +
           ' name=\"Start Event\"><bpmn:outgoing>SequenceFlow_1jdocur</bpmn:outgoing><bpmn:outgoing>SequenceFlow_0y5m38r</bpmn:outgoing>' +
           '</bpmn:startEvent><bpmn:sequenceFlow id=\"SequenceFlow_1jdocur\" name=\"\" sourceRef=\"StartEvent_1mox3jl\" ' +
           'targetRef=\"EndEvent_0eie6q6\" /><bpmn:endEvent id=\"EndEvent_0eie6q6\" name=\"End Event\"><bpmn:incoming>SequenceFlow_1jdocur' +
           '</bpmn:incoming></bpmn:endEvent><bpmn:sequenceFlow id=\"SequenceFlow_0y5m38r\" sourceRef=\"StartEvent_1mox3jl\" ' +
           'targetRef=\"Task_0z3p6gi\" /><bpmn:scriptTask id=\"Task_0z3p6gi\" name=\"Hello\"><bpmn:incoming>SequenceFlow_0y5m38r' +
           '</bpmn:incoming><bpmn:script>console.log(\"Hello World\")</bpmn:script></bpmn:scriptTask></bpmn:process><bpmndi:BPMNDiagram ' +
           'id=\"BPMNDiagram_1\"><bpmndi:BPMNPlane id=\"BPMNPlane_1\" bpmnElement=\"Collaboration_1cidyxu\"><bpmndi:BPMNShape ' +
           'id=\"Participant_0px403d_di\" bpmnElement=\"Participant_0px403d\"><dc:Bounds x=\"5\" y=\"4\" width=\"581\" height=\"170\" ' +
           '/></bpmndi:BPMNShape><bpmndi:BPMNShape id=\"Lane_1xzf0d3_di\" bpmnElement=\"Lane_1xzf0d3\"><dc:Bounds x=\"35\" y=\"4\" ' +
           'width=\"551\" height=\"170\" /></bpmndi:BPMNShape><bpmndi:BPMNShape id=\"StartEvent_1mox3jl_di\" bpmnElement=\"StartEvent_1mox3jl\">' +
           '<dc:Bounds x=\"83\" y=\"69\" width=\"36\" height=\"36\" /></bpmndi:BPMNShape><bpmndi:BPMNShape id=\"EndEvent_0eie6q6_di\" ' +
           'bpmnElement=\"EndEvent_0eie6q6\"><dc:Bounds x=\"503\" y=\"69\" width=\"36\" height=\"36\" /></bpmndi:BPMNShape><bpmndi:BPMNEdge ' +
           'id=\"SequenceFlow_1jdocur_di\" bpmnElement=\"SequenceFlow_1jdocur\"><di:waypoint x=\"119\" y=\"87\" /><di:waypoint x=\"503\" y=\"87\" ' +
           '/></bpmndi:BPMNEdge><bpmndi:BPMNEdge id=\"SequenceFlow_0y5m38r_di\" bpmnElement=\"SequenceFlow_0y5m38r\"><di:waypoint x=\"119\" ' +
           'y=\"87\" /><di:waypoint x=\"169\" y=\"87\" /></bpmndi:BPMNEdge><bpmndi:BPMNShape id=\"ScriptTask_188qtll_di\" ' +
           'bpmnElement=\"Task_0z3p6gi\"><dc:Bounds x=\"169\" y=\"47\" width=\"100\" height=\"80\" /></bpmndi:BPMNShape>' +
           '</bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn:definitions>',
    }, {
      authorization: 'Bearer ZHVtbXlfdG9rZW4=',
      /* To debug post call please add following:
       *  .stringBody.then((respose: string) => {
       *    console.log(response);
       *  }
       */
    });
  }

  public postProcessModelWithMessageIntermediateThrowEvent(processModel?: string): void {
    let currentModel: string = this.processModelID;
    if (processModel !== undefined) {
      currentModel = processModel;
    }

    this._http.post('/api/management/v1/process_models/' + currentModel + '/update', {
      xml: '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<bpmn:definitions xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\"  ' +
      'xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:dc=\"http://www.omg.org/spec/DD/20100524/DC\"  ' +
      'xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:di=\"http://www.omg.org/spec/DD/20100524/DI\"  ' +
      'id=\"Definition_1\" targetNamespace=\"http://bpmn.io/schema/bpmn\" exporter=\"BPMN Studio\" exporterVersion=\"1\"> ' +
      '<bpmn:collaboration id=\"Collaboration_1cidyxu\" name=\"\"><bpmn:participant id=\"Participant_0px403d\" name=\"' + currentModel + '\"  ' +
      'processRef=\"' + currentModel + '\" /></bpmn:collaboration><bpmn:process id=\"' + currentModel + '\" name=\"' +
      currentModel + '\" isExecutable=\"true\"> ' +
      '<bpmn:laneSet><bpmn:lane id=\"Lane_1xzf0d3\" name=\"Lane\"><bpmn:flowNodeRef>StartEvent_1mox3jl</bpmn:flowNodeRef> ' +
      '<bpmn:flowNodeRef>EndEvent_0eie6q6</bpmn:flowNodeRef><bpmn:flowNodeRef>Task_0z3p6gi</bpmn:flowNodeRef><bpmn:flowNodeRef> ' +
      'IntermediateThrowEvent_0579cd8</bpmn:flowNodeRef></bpmn:lane></bpmn:laneSet><bpmn:startEvent id=\"StartEvent_1mox3jl\"  ' +
      'name=\"Start Event\"><bpmn:outgoing>SequenceFlow_1jdocur</bpmn:outgoing><bpmn:outgoing>SequenceFlow_0y5m38r</bpmn:outgoing> ' +
      '</bpmn:startEvent><bpmn:sequenceFlow id=\"SequenceFlow_1jdocur\" name=\"\" sourceRef=\"StartEvent_1mox3jl\"  ' +
      'targetRef=\"EndEvent_0eie6q6\" /><bpmn:endEvent id=\"EndEvent_0eie6q6\" name=\"End Event\"> ' +
      '<bpmn:incoming>SequenceFlow_1jdocur</bpmn:incoming></bpmn:endEvent><bpmn:sequenceFlow id=\"SequenceFlow_0y5m38r\"  ' +
      'sourceRef=\"StartEvent_1mox3jl\" targetRef=\"Task_0z3p6gi\" /><bpmn:scriptTask id=\"Task_0z3p6gi\" name=\"Hello\"> ' +
      '<bpmn:incoming>SequenceFlow_0y5m38r</bpmn:incoming><bpmn:outgoing>SequenceFlow_1aahkv9</bpmn:outgoing> ' +
      '<bpmn:script>console.log(\"Hello World\")</bpmn:script></bpmn:scriptTask><bpmn:sequenceFlow id=\"SequenceFlow_1aahkv9\"  ' +
      'name=\"\" sourceRef=\"Task_0z3p6gi\" targetRef=\"IntermediateThrowEvent_0579cd8\" /><bpmn:intermediateCatchEvent  ' +
      'id=\"IntermediateThrowEvent_0579cd8\" name=\"\"><bpmn:incoming>SequenceFlow_1aahkv9</bpmn:incoming> ' +
      '<bpmn:messageEventDefinition messageRef=\"Message_SFxLxND7\" /></bpmn:intermediateCatchEvent></bpmn:process> ' +
      '<bpmn:message id=\"Message_SFxLxND7\" name=\"Message Name\" /><bpmndi:BPMNDiagram id=\"BPMNDiagram_1\"> ' +
      '<bpmndi:BPMNPlane id=\"BPMNPlane_1\" bpmnElement=\"Collaboration_1cidyxu\"><bpmndi:BPMNShape id=\"Participant_0px403d_di\"  ' +
      'bpmnElement=\"Participant_0px403d\"><dc:Bounds x=\"5\" y=\"21\" width=\"562\" height=\"135\" /></bpmndi:BPMNShape> ' +
      '<bpmndi:BPMNShape id=\"Lane_1xzf0d3_di\" bpmnElement=\"Lane_1xzf0d3\"><dc:Bounds x=\"35\" y=\"21\" width=\"532\"  ' +
      'height=\"135\" /></bpmndi:BPMNShape><bpmndi:BPMNShape id=\"StartEvent_1mox3jl_di\" bpmnElement=\"StartEvent_1mox3jl\"> ' +
      '<dc:Bounds x=\"83\" y=\"69\" width=\"36\" height=\"36\" /></bpmndi:BPMNShape><bpmndi:BPMNShape id=\"EndEvent_0eie6q6_di\"  ' +
      'bpmnElement=\"EndEvent_0eie6q6\"><dc:Bounds x=\"503\" y=\"69\" width=\"36\" height=\"36\" /></bpmndi:BPMNShape> ' +
      '<bpmndi:BPMNEdge id=\"SequenceFlow_1jdocur_di\" bpmnElement=\"SequenceFlow_1jdocur\"><di:waypoint x=\"119\"  ' +
      'y=\"87\" /><di:waypoint x=\"503\" y=\"87\" /></bpmndi:BPMNEdge><bpmndi:BPMNEdge id=\"SequenceFlow_0y5m38r_di\"  ' +
      'bpmnElement=\"SequenceFlow_0y5m38r\"><di:waypoint x=\"119\" y=\"87\" /><di:waypoint x=\"169\" y=\"87\" /></bpmndi:BPMNEdge> ' +
      '<bpmndi:BPMNShape id=\"ScriptTask_188qtll_di\" bpmnElement=\"Task_0z3p6gi\"><dc:Bounds x=\"169\" y=\"47\" width=\"100\"  ' +
      'height=\"80\" /></bpmndi:BPMNShape><bpmndi:BPMNEdge id=\"SequenceFlow_1aahkv9_di\" bpmnElement=\"SequenceFlow_1aahkv9\"> ' +
      '<di:waypoint x=\"269\" y=\"87\" /><di:waypoint x=\"319\" y=\"87\" /></bpmndi:BPMNEdge><bpmndi:BPMNShape  ' +
      'id=\"IntermediateCatchEvent_0q2wvt3_di\" bpmnElement=\"IntermediateThrowEvent_0579cd8\"><dc:Bounds x=\"319\" y=\"69\"  ' +
      'width=\"36\" height=\"36\" /></bpmndi:BPMNShape></bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn:definitions>',
    }, {
      authorization: 'Bearer ZHVtbXlfdG9rZW4=',
      /* To debug post call please add following:
       *  .stringBody.then((respose: string) => {
       *    console.log(response);
       *  }
       */
    });
  }

  public startProcess(processModel?: string): void {
    let currentModel: string = this.processModelID;
    if (processModel !== undefined) {
      currentModel = processModel;
    }

    this._http.post('/api/management/v1/process_models/' + currentModel + '/start_events/StartEvent_1mox3jl/start?start_callback_type=1', {
      authorization: 'Bearer ZHVtbXlfdG9rZW4=',
      /* To debug post call please add following:
       *  .stringBody.then((respose: string) => {
       *    console.log(response);
       *  }
       */
    });
  }
}
