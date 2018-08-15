import {ProcessDefListPage} from './pages/processdef-list-page';

import {browser, by, element, ElementFinder, protractor, ProtractorExpectedConditions} from 'protractor';
import {HttpClient} from 'protractor-http-client';

fdescribe('processDefList', () => {

  const aureliaUrl: string = browser.params.aureliaUrl;
  const defaultTimeoutMS: number = browser.params.defaultTimeoutMS;

  const expectedConditions: ProtractorExpectedConditions = protractor.ExpectedConditions;
  const statusBar: ElementFinder = element(by.tagName('status-bar'));

  browser.driver.manage().deleteAllCookies();

  beforeEach(() => {
    browser.get(aureliaUrl);
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(statusBar), defaultTimeoutMS);
      return statusBar;
    });
  });

  beforeAll(() => {
    const http: HttpClient = new HttpClient('http://localhost:8000');
    http.post('/api/management/v1/process_models/test/update', {
      // tslint:disable-next-line:max-line-length
      xml: '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<bpmn:definitions xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:dc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:di=\"http://www.omg.org/spec/DD/20100524/DI\" id=\"Definition_1\" targetNamespace=\"http://bpmn.io/schema/bpmn\" exporter=\"BPMN Studio\" exporterVersion=\"1\"><bpmn:collaboration id=\"Collaboration_1cidyxu\" name=\"\"><bpmn:participant id=\"Participant_0px403d\" name=\"test\" processRef=\"test\" /></bpmn:collaboration><bpmn:process id=\"test\" name=\"test\" isExecutable=\"false\"><bpmn:laneSet><bpmn:lane id=\"Lane_1xzf0d3\" name=\"Lane\"><bpmn:flowNodeRef>StartEvent_1mox3jl</bpmn:flowNodeRef><bpmn:flowNodeRef>EndEvent_0eie6q6</bpmn:flowNodeRef><bpmn:flowNodeRef>Task_0z3p6gi</bpmn:flowNodeRef></bpmn:lane></bpmn:laneSet><bpmn:startEvent id=\"StartEvent_1mox3jl\" name=\"Start Event\"><bpmn:outgoing>SequenceFlow_1jdocur</bpmn:outgoing><bpmn:outgoing>SequenceFlow_0y5m38r</bpmn:outgoing></bpmn:startEvent><bpmn:sequenceFlow id=\"SequenceFlow_1jdocur\" name=\"\" sourceRef=\"StartEvent_1mox3jl\" targetRef=\"EndEvent_0eie6q6\" /><bpmn:endEvent id=\"EndEvent_0eie6q6\" name=\"End Event\"><bpmn:incoming>SequenceFlow_1jdocur</bpmn:incoming></bpmn:endEvent><bpmn:sequenceFlow id=\"SequenceFlow_0y5m38r\" sourceRef=\"StartEvent_1mox3jl\" targetRef=\"Task_0z3p6gi\" /><bpmn:scriptTask id=\"Task_0z3p6gi\" name=\"Hello\"><bpmn:incoming>SequenceFlow_0y5m38r</bpmn:incoming><bpmn:script>console.log(\"Hello World\")</bpmn:script></bpmn:scriptTask></bpmn:process><bpmndi:BPMNDiagram id=\"BPMNDiagram_1\"><bpmndi:BPMNPlane id=\"BPMNPlane_1\" bpmnElement=\"Collaboration_1cidyxu\"><bpmndi:BPMNShape id=\"Participant_0px403d_di\" bpmnElement=\"Participant_0px403d\"><dc:Bounds x=\"5\" y=\"4\" width=\"581\" height=\"170\" /></bpmndi:BPMNShape><bpmndi:BPMNShape id=\"Lane_1xzf0d3_di\" bpmnElement=\"Lane_1xzf0d3\"><dc:Bounds x=\"35\" y=\"4\" width=\"551\" height=\"170\" /></bpmndi:BPMNShape><bpmndi:BPMNShape id=\"StartEvent_1mox3jl_di\" bpmnElement=\"StartEvent_1mox3jl\"><dc:Bounds x=\"83\" y=\"69\" width=\"36\" height=\"36\" /></bpmndi:BPMNShape><bpmndi:BPMNShape id=\"EndEvent_0eie6q6_di\" bpmnElement=\"EndEvent_0eie6q6\"><dc:Bounds x=\"503\" y=\"69\" width=\"36\" height=\"36\" /></bpmndi:BPMNShape><bpmndi:BPMNEdge id=\"SequenceFlow_1jdocur_di\" bpmnElement=\"SequenceFlow_1jdocur\"><di:waypoint x=\"119\" y=\"87\" /><di:waypoint x=\"503\" y=\"87\" /></bpmndi:BPMNEdge><bpmndi:BPMNEdge id=\"SequenceFlow_0y5m38r_di\" bpmnElement=\"SequenceFlow_0y5m38r\"><di:waypoint x=\"119\" y=\"87\" /><di:waypoint x=\"169\" y=\"87\" /></bpmndi:BPMNEdge><bpmndi:BPMNShape id=\"ScriptTask_188qtll_di\" bpmnElement=\"Task_0z3p6gi\"><dc:Bounds x=\"169\" y=\"47\" width=\"100\" height=\"80\" /></bpmndi:BPMNShape></bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn:definitions>',
    },
    {
      authorization: 'Bearer ZHVtbXlfdG9rZW4=',
      // For debugging please change this line to:
      // .stringBody.then((respose: string)
    }).statusCode.then((respose: number) => {
      // tslint:disable-next-line:no-console
      console.log(respose);
    });
  });

  it('should display process definitions', () => {
    const processDefListPage: ProcessDefListPage = new ProcessDefListPage();
    expect(processDefListPage.processDefs.count()).toBeGreaterThan(0);
  });

  afterEach(() => {
    browser.executeScript('window.localStorage.clear();');
    browser.executeScript('window.sessionStorage.clear();');
    browser.driver.manage().deleteAllCookies();
  });
});
