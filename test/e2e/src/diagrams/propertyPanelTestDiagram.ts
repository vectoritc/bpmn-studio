import {browser} from 'protractor';
import {HttpClient} from 'protractor-http-client';

interface RequestObject {
  [key: string]: string;
}

export class PropertyPanelTestDiagram {
  // tslint:disable-next-line:no-magic-numbers
  public name: string =  'TA_' + Math.floor(Math.random() * 1000000);

  public participantId: string = 'PPTest_Participant';
  public startEventId: string = 'PPTest_StartEvent';
  public endEventId: string = 'PPTest_EndEvent';
  public scriptTaskId: string = 'PPTest_Task_Script';
  public messageReceiveTaskId: string = 'PPTest_Task_MessageReceive';
  public messageSendTaskId: string = 'PPTest_Task_MessageSend';
  public serviceTaskId: string = 'PPTest_Task_Service';
  public callActivityId: string = 'PPTest_Task_CallActivity';
  public intermediateTimerEventId: string = 'PPTest_IntermediateThrowEvent_Timer';
  public intermediateMessageCatchEvent: string = 'PPTest_IntermediateThrowEvent_Message_Catch';
  public intermediateMessageSendEvent: string = 'PPTest_IntermediateThrowEvent_Message_Send';
  public intermediateEscalationEvent: string = 'PPTest_IntermediateThrowEvent_Escalation';
  public intermediateSignalCatchEvent: string = 'PPTest_IntermediateThrowEvent_Signal_Catch';
  public intermediateSignalSendEvent: string = 'PPTest_IntermediateThrowEvent_Signal_Send';
  public timerStartEventId: string = 'PTest_StartEvent_Timer';
  public signalStartEventId: string = 'PPTest_StartEvent_Signal';
  public messageStartEventId: string = 'PPTest_StartEvent_Message';

  // Define Instances
  private _processEngineUrl: string = browser.params.processEngineUrl;
  private _http: HttpClient = new HttpClient(this._processEngineUrl);

  public async deployDiagram(): Promise<void> {
    const requestDestination: string = `/api/management/v1/process_models/${this.name}/update`;
    const requestPayload: any = {
      xml: `<?xml version="1.0" encoding="UTF-8"?>
      <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                        xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                        xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                        xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                        xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
                        id="Definition_1" targetNamespace="http://bpmn.io/schema/bpmn"
                        exporter="BPMN Studio" exporterVersion="1">
        <bpmn:collaboration id="Collaboration_1cidyxu" name="">
          <bpmn:participant id="${this.participantId}" name="${this.name}" processRef="${this.name}" />
        </bpmn:collaboration>
        <bpmn:process id="${this.name}" name="${this.name}" isExecutable="true">
          <bpmn:laneSet>
            <bpmn:lane id="Lane_1xzf0d3" name="Lane">
              <bpmn:flowNodeRef>${this.startEventId}</bpmn:flowNodeRef>
              <bpmn:flowNodeRef>${this.endEventId}</bpmn:flowNodeRef>
              <bpmn:flowNodeRef>${this.scriptTaskId}</bpmn:flowNodeRef>
              <bpmn:flowNodeRef>${this.messageReceiveTaskId}</bpmn:flowNodeRef>
              <bpmn:flowNodeRef>${this.messageSendTaskId}</bpmn:flowNodeRef>
              <bpmn:flowNodeRef>${this.serviceTaskId}</bpmn:flowNodeRef>
              <bpmn:flowNodeRef>${this.callActivityId}</bpmn:flowNodeRef>
              <bpmn:flowNodeRef>${this.intermediateTimerEventId}</bpmn:flowNodeRef>
              <bpmn:flowNodeRef>${this.intermediateMessageCatchEvent}</bpmn:flowNodeRef>
              <bpmn:flowNodeRef>${this.intermediateMessageSendEvent}</bpmn:flowNodeRef>
              <bpmn:flowNodeRef>${this.intermediateEscalationEvent}</bpmn:flowNodeRef>
              <bpmn:flowNodeRef>${this.intermediateSignalCatchEvent}</bpmn:flowNodeRef>
              <bpmn:flowNodeRef>${this.intermediateSignalSendEvent}</bpmn:flowNodeRef>
              <bpmn:flowNodeRef>${this.timerStartEventId}</bpmn:flowNodeRef>
              <bpmn:flowNodeRef>${this.signalStartEventId}</bpmn:flowNodeRef>
              <bpmn:flowNodeRef>${this.messageStartEventId}</bpmn:flowNodeRef>
            </bpmn:lane>
          </bpmn:laneSet>
          <bpmn:startEvent id="${this.startEventId}" name="Start Event">
            <bpmn:outgoing>SequenceFlow_09xww6m</bpmn:outgoing>
          </bpmn:startEvent>
          <bpmn:sequenceFlow id="SequenceFlow_09xww6m" sourceRef="${this.startEventId}" targetRef="${this.scriptTaskId}" />
          <bpmn:sequenceFlow id="SequenceFlow_0l5hxrn" sourceRef="${this.scriptTaskId}" targetRef="${this.messageReceiveTaskId}" />
          <bpmn:sequenceFlow id="SequenceFlow_1ue8q8l" sourceRef="${this.messageReceiveTaskId}" targetRef="${this.messageSendTaskId}" />
          <bpmn:sequenceFlow id="SequenceFlow_00zb8fl" sourceRef="${this.messageSendTaskId}" targetRef="${this.serviceTaskId}" />
          <bpmn:sequenceFlow id="SequenceFlow_04i2z89" sourceRef="${this.serviceTaskId}" targetRef="${this.callActivityId}" />
          <bpmn:sequenceFlow id="SequenceFlow_053sdae" sourceRef="${this.callActivityId}" targetRef="${this.endEventId}" />
          <bpmn:endEvent id="${this.endEventId}" name="End Event">
            <bpmn:incoming>SequenceFlow_053sdae</bpmn:incoming>
          </bpmn:endEvent>
          <bpmn:scriptTask id="${this.scriptTaskId}" name="">
            <bpmn:incoming>SequenceFlow_09xww6m</bpmn:incoming>
            <bpmn:incoming>SequenceFlow_1d5e2h0</bpmn:incoming>
            <bpmn:incoming>SequenceFlow_0swhu74</bpmn:incoming>
            <bpmn:outgoing>SequenceFlow_0l5hxrn</bpmn:outgoing>
            <bpmn:script>aowifhawoi</bpmn:script>
          </bpmn:scriptTask>
          <bpmn:receiveTask id="${this.messageReceiveTaskId}" name="" messageRef="Message_3Ythx4Yn">
            <bpmn:incoming>SequenceFlow_0l5hxrn</bpmn:incoming>
            <bpmn:incoming>SequenceFlow_0qt5fqp</bpmn:incoming>
            <bpmn:incoming>SequenceFlow_1ch4uf2</bpmn:incoming>
            <bpmn:outgoing>SequenceFlow_1ue8q8l</bpmn:outgoing>
          </bpmn:receiveTask>
          <bpmn:sendTask id="${this.messageSendTaskId}" name="" messageRef="Message_3Ythx4Yn">
            <bpmn:incoming>SequenceFlow_1ue8q8l</bpmn:incoming>
            <bpmn:incoming>SequenceFlow_1x63ool</bpmn:incoming>
            <bpmn:incoming>SequenceFlow_0jb75u2</bpmn:incoming>
            <bpmn:outgoing>SequenceFlow_00zb8fl</bpmn:outgoing>
          </bpmn:sendTask>
          <bpmn:serviceTask id="${this.serviceTaskId}">
            <bpmn:extensionElements>
              <camunda:properties />
              <camunda:properties />
              <camunda:properties />
            </bpmn:extensionElements>
            <bpmn:incoming>SequenceFlow_00zb8fl</bpmn:incoming>
            <bpmn:incoming>SequenceFlow_0rhetgr</bpmn:incoming>
            <bpmn:incoming>SequenceFlow_12o2b6h</bpmn:incoming>
            <bpmn:outgoing>SequenceFlow_04i2z89</bpmn:outgoing>
          </bpmn:serviceTask>
          <bpmn:callActivity id="${this.callActivityId}" name="">
            <bpmn:incoming>SequenceFlow_04i2z89</bpmn:incoming>
            <bpmn:incoming>SequenceFlow_1j5zur3</bpmn:incoming>
            <bpmn:outgoing>SequenceFlow_053sdae</bpmn:outgoing>
          </bpmn:callActivity>
          <bpmn:intermediateCatchEvent id="${this.intermediateTimerEventId}">
            <bpmn:outgoing>SequenceFlow_1d5e2h0</bpmn:outgoing>
            <bpmn:timerEventDefinition>
              <bpmn:timeDate xsi:type="bpmn:tFormalExpression" />
            </bpmn:timerEventDefinition>
          </bpmn:intermediateCatchEvent>
          <bpmn:sequenceFlow id="SequenceFlow_1d5e2h0" sourceRef="${this.intermediateTimerEventId}" targetRef="${this.scriptTaskId}" />
          <bpmn:intermediateCatchEvent id="${this.intermediateMessageCatchEvent}">
            <bpmn:outgoing>SequenceFlow_0qt5fqp</bpmn:outgoing>
            <bpmn:messageEventDefinition messageRef="Message_3Ythx4Yn" />
          </bpmn:intermediateCatchEvent>
          <bpmn:sequenceFlow id="SequenceFlow_0qt5fqp" sourceRef="${this.intermediateMessageCatchEvent}" targetRef="${this.messageReceiveTaskId}" />
          <bpmn:intermediateThrowEvent id="${this.intermediateMessageSendEvent}">
            <bpmn:outgoing>SequenceFlow_1x63ool</bpmn:outgoing>
            <bpmn:messageEventDefinition messageRef="Message_3Ythx4Yn" />
          </bpmn:intermediateThrowEvent>
          <bpmn:sequenceFlow id="SequenceFlow_1x63ool" sourceRef="${this.intermediateMessageSendEvent}" targetRef="${this.messageSendTaskId}" />
          <bpmn:intermediateThrowEvent id="${this.intermediateEscalationEvent}" name="">
            <bpmn:outgoing>SequenceFlow_0rhetgr</bpmn:outgoing>
            <bpmn:escalationEventDefinition escalationRef="Escalation_x57IyDG4" />
          </bpmn:intermediateThrowEvent>
          <bpmn:sequenceFlow id="SequenceFlow_0rhetgr" sourceRef="${this.intermediateEscalationEvent}" targetRef="${this.serviceTaskId}" />
          <bpmn:intermediateCatchEvent id="${this.intermediateSignalCatchEvent}">
            <bpmn:outgoing>SequenceFlow_1j5zur3</bpmn:outgoing>
            <bpmn:signalEventDefinition signalRef="Signal_i7DAygfG" />
          </bpmn:intermediateCatchEvent>
          <bpmn:sequenceFlow id="SequenceFlow_1j5zur3" sourceRef="${this.intermediateSignalCatchEvent}" targetRef="${this.callActivityId}" />
          <bpmn:intermediateThrowEvent id="${this.intermediateSignalSendEvent}" name="">
            <bpmn:outgoing>SequenceFlow_0swhu74</bpmn:outgoing>
            <bpmn:signalEventDefinition signalRef="Signal_i7DAygfG" />
          </bpmn:intermediateThrowEvent>
          <bpmn:sequenceFlow id="SequenceFlow_0swhu74" sourceRef="${this.intermediateSignalSendEvent}" targetRef="${this.scriptTaskId}" />
          <bpmn:startEvent id="${this.timerStartEventId}">
            <bpmn:outgoing>SequenceFlow_1ch4uf2</bpmn:outgoing>
            <bpmn:timerEventDefinition />
          </bpmn:startEvent>
          <bpmn:sequenceFlow id="SequenceFlow_1ch4uf2" sourceRef="${this.timerStartEventId}" targetRef="${this.messageReceiveTaskId}" />
          <bpmn:startEvent id="${this.signalStartEventId}">
            <bpmn:outgoing>SequenceFlow_0jb75u2</bpmn:outgoing>
            <bpmn:signalEventDefinition />
          </bpmn:startEvent>
          <bpmn:sequenceFlow id="SequenceFlow_0jb75u2" sourceRef="${this.signalStartEventId}" targetRef="${this.messageSendTaskId}" />
          <bpmn:startEvent id="${this.messageStartEventId}">
            <bpmn:outgoing>SequenceFlow_12o2b6h</bpmn:outgoing>
            <bpmn:messageEventDefinition />
          </bpmn:startEvent>
          <bpmn:sequenceFlow id="SequenceFlow_12o2b6h" sourceRef="${this.messageStartEventId}" targetRef="${this.serviceTaskId}" />
        </bpmn:process>
        <bpmn:message id="Message_3Ythx4Yn" name="Message Name" />
        <bpmn:escalation id="Escalation_x57IyDG4" name="Escalation Name" />
        <bpmn:signal id="Signal_i7DAygfG" name="Signal Name" />
        <bpmndi:BPMNDiagram id="BPMNDiagram_1">
          <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_1cidyxu">
            <bpmndi:BPMNShape id="${this.participantId}_di" bpmnElement="${this.participantId}">
              <dc:Bounds x="-306" y="-2" width="1218" height="299" />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="Lane_1xzf0d3_di" bpmnElement="Lane_1xzf0d3">
              <dc:Bounds x="-276" y="-2" width="1188" height="299" />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="StartEvent_1mox3jl_di" bpmnElement="${this.startEventId}">
              <dc:Bounds x="-218" y="125" width="36" height="36" />
              <bpmndi:BPMNLabel>
                <dc:Bounds x="-227" y="161" width="55" height="14" />
              </bpmndi:BPMNLabel>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="EndEvent_0eie6q6_di" bpmnElement="${this.endEventId}">
              <dc:Bounds x="858" y="125" width="36" height="36" />
              <bpmndi:BPMNLabel>
                <dc:Bounds x="851" y="161" width="51" height="14" />
              </bpmndi:BPMNLabel>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNEdge id="SequenceFlow_09xww6m_di" bpmnElement="SequenceFlow_09xww6m">
              <di:waypoint x="-182" y="143" />
              <di:waypoint x="-95" y="143" />
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNShape id="ScriptTask_1a3j0rr_di" bpmnElement="${this.scriptTaskId}">
              <dc:Bounds x="-95" y="103" width="100" height="80" />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNEdge id="SequenceFlow_0l5hxrn_di" bpmnElement="SequenceFlow_0l5hxrn">
              <di:waypoint x="5" y="143" />
              <di:waypoint x="97" y="143" />
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="SequenceFlow_1ue8q8l_di" bpmnElement="SequenceFlow_1ue8q8l">
              <di:waypoint x="197" y="143" />
              <di:waypoint x="289" y="143" />
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="SequenceFlow_00zb8fl_di" bpmnElement="SequenceFlow_00zb8fl">
              <di:waypoint x="389" y="143" />
              <di:waypoint x="481" y="143" />
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="SequenceFlow_04i2z89_di" bpmnElement="SequenceFlow_04i2z89">
              <di:waypoint x="581" y="143" />
              <di:waypoint x="673" y="143" />
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="SequenceFlow_053sdae_di" bpmnElement="SequenceFlow_053sdae">
              <di:waypoint x="773" y="143" />
              <di:waypoint x="858" y="143" />
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNShape id="ReceiveTask_11pt3l4_di" bpmnElement="${this.messageReceiveTaskId}">
              <dc:Bounds x="97" y="103" width="100" height="80" />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="SendTask_1s2poxu_di" bpmnElement="${this.messageSendTaskId}">
              <dc:Bounds x="289" y="103" width="100" height="80" />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="ServiceTask_04h5hnm_di" bpmnElement="${this.serviceTaskId}">
              <dc:Bounds x="481" y="103" width="100" height="80" />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="CallActivity_0e8q8do_di" bpmnElement="${this.callActivityId}">
              <dc:Bounds x="673" y="103" width="100" height="80" />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="IntermediateCatchEvent_0xypr88_di" bpmnElement="${this.intermediateMessageCatchEvent}">
              <dc:Bounds x="19" y="218" width="36" height="36" />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="IntermediateThrowEvent_1jdlrjo_di" bpmnElement="${this.intermediateMessageSendEvent}">
              <dc:Bounds x="224" y="218" width="36" height="36" />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="IntermediateCatchEvent_1c3tppg_di" bpmnElement="${this.intermediateTimerEventId}">
              <dc:Bounds x="-218" y="218" width="36" height="36" />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="IntermediateThrowEvent_04vq9qm_di" bpmnElement="${this.intermediateEscalationEvent}">
              <dc:Bounds x="413" y="218" width="36" height="36" />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="IntermediateCatchEvent_15px35x_di" bpmnElement="${this.intermediateSignalCatchEvent}">
              <dc:Bounds x="606" y="218" width="36" height="36" />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNEdge id="SequenceFlow_1d5e2h0_di" bpmnElement="SequenceFlow_1d5e2h0">
              <di:waypoint x="-182" y="236" />
              <di:waypoint x="-45" y="236" />
              <di:waypoint x="-45" y="183" />
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="SequenceFlow_0qt5fqp_di" bpmnElement="SequenceFlow_0qt5fqp">
              <di:waypoint x="55" y="236" />
              <di:waypoint x="147" y="236" />
              <di:waypoint x="147" y="183" />
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="SequenceFlow_1x63ool_di" bpmnElement="SequenceFlow_1x63ool">
              <di:waypoint x="260" y="236" />
              <di:waypoint x="339" y="236" />
              <di:waypoint x="339" y="183" />
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="SequenceFlow_0rhetgr_di" bpmnElement="SequenceFlow_0rhetgr">
              <di:waypoint x="449" y="236" />
              <di:waypoint x="531" y="236" />
              <di:waypoint x="531" y="183" />
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="SequenceFlow_1j5zur3_di" bpmnElement="SequenceFlow_1j5zur3">
              <di:waypoint x="642" y="236" />
              <di:waypoint x="723" y="236" />
              <di:waypoint x="723" y="183" />
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNShape id="IntermediateThrowEvent_08htr9z_di" bpmnElement="${this.intermediateSignalSendEvent}">
              <dc:Bounds x="-218" y="35" width="36" height="36" />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNEdge id="SequenceFlow_0swhu74_di" bpmnElement="SequenceFlow_0swhu74">
              <di:waypoint x="-182" y="53" />
              <di:waypoint x="-45" y="53" />
              <di:waypoint x="-45" y="103" />
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNShape id="StartEvent_0i9rkuq_di" bpmnElement="${this.timerStartEventId}">
              <dc:Bounds x="19" y="35" width="36" height="36" />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNEdge id="SequenceFlow_1ch4uf2_di" bpmnElement="SequenceFlow_1ch4uf2">
              <di:waypoint x="55" y="53" />
              <di:waypoint x="147" y="53" />
              <di:waypoint x="147" y="103" />
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNShape id="StartEvent_1p5mby7_di" bpmnElement="${this.signalStartEventId}">
              <dc:Bounds x="224" y="35" width="36" height="36" />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNEdge id="SequenceFlow_0jb75u2_di" bpmnElement="SequenceFlow_0jb75u2">
              <di:waypoint x="260" y="53" />
              <di:waypoint x="339" y="53" />
              <di:waypoint x="339" y="103" />
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNShape id="StartEvent_170kavg_di" bpmnElement="${this.messageStartEventId}">
              <dc:Bounds x="413" y="35" width="36" height="36" />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNEdge id="SequenceFlow_12o2b6h_di" bpmnElement="SequenceFlow_12o2b6h">
              <di:waypoint x="449" y="53" />
              <di:waypoint x="531" y="53" />
              <di:waypoint x="531" y="103" />
            </bpmndi:BPMNEdge>
          </bpmndi:BPMNPlane>
        </bpmndi:BPMNDiagram>
      </bpmn:definitions>`,
    };
    const requestHeaders: RequestObject = {
      authorization: 'Bearer ZHVtbXlfdG9rZW4=',
    };

    await this._http.post(requestDestination, requestPayload, requestHeaders);
  }

  public async deleteDiagram(): Promise<void> {
    const requestDestination: string = `/api/management/v1/process_models/${this.name}/delete`;
    const requestHeaders: RequestObject = {
      authorization: 'Bearer ZHVtbXlfdG9rZW4=',
    };

    await this._http.get(requestDestination, requestHeaders);
  }
}
