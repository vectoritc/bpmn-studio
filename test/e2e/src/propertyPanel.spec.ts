import {browser} from 'protractor';

import {PropertyPanelTestDiagram} from './diagrams/propertyPanelTestDiagram';
import {DiagramDetail} from './pages/diagramDetail';
import {PropertyPanel} from './pages/propertyPanel';
import {RouterView} from './pages/routerView';

describe('Property Panel', () => {

  let diagram: PropertyPanelTestDiagram;
  let routerView: RouterView;
  let diagramDetail: DiagramDetail;
  let propertyPanel: PropertyPanel;

  const applicationUrl: string = browser.params.aureliaUrl;

  beforeAll(async() => {
    diagram = new PropertyPanelTestDiagram();
    routerView = new RouterView();
    diagramDetail = new DiagramDetail(applicationUrl, diagram.name);
    propertyPanel = new PropertyPanel();

    await diagram.deployDiagram();
  });

  afterAll(async() => {
    await diagram.deleteDiagram();
  });

  beforeEach(async() => {
    await routerView.show();
    await diagramDetail.show();
    await propertyPanel.show();
  });

  it('should show general basics section after loading of the diagram.', async() => {
    const visibilityOfGeneralBasicsSection: boolean = await propertyPanel.getVisibilityOfGeneralBasicsSection();

    expect(visibilityOfGeneralBasicsSection).toBeTruthy();
  });

  it('should show general basics section after click on StartEvent.', async() => {
    await diagramDetail.clickOnElement(diagram.startEventId);

    const visibilityOfGeneralBasicsSection: boolean = await propertyPanel.getVisibilityOfGeneralBasicsSection();

    expect(visibilityOfGeneralBasicsSection).toBeTruthy();
  });

  it('should show CallActivity section after click on CallActivity.', async() => {
    await diagramDetail.clickOnElement(diagram.callActivityId);

    const visbilityOfCallActivitySection: boolean = await propertyPanel.getVisibilityOfCallActivitySection();

    expect(visbilityOfCallActivitySection).toBeTruthy();
  });

  it('should show ConditionalEvent section after click on ConditionalEvent.', async() => {
    await diagramDetail.clickOnElement(diagram.conditionalBoundaryEventId);

    const visibilityOfConditionalEventSection: boolean = await propertyPanel.getVisibilityOfConditionalEventSection();

    expect(visibilityOfConditionalEventSection).toBeTruthy();
  });

  it('should show ErrorEvent section after click on ErrorEvent.', async() => {
    await diagramDetail.clickOnElement(diagram.errorBoundaryEventId);

    const visbilityOfErrorEventSection: boolean = await propertyPanel.getVisibilityOfErrorEventSection();

    expect(visbilityOfErrorEventSection).toBeTruthy();
  });

  it('should show EscalationEvent section after click on EscalationEvent.', async() => {
    await diagramDetail.clickOnElement(diagram.intermediateEscalationEventId);

    const visbilityOfEscalationEventSection: boolean = await propertyPanel.getVisibilityOfEscalationEventSection();

    expect(visbilityOfEscalationEventSection).toBeTruthy();
  });

  it('should show MessageEvent section after click on MessageCatchEvent.', async() => {
    await diagramDetail.clickOnElement(diagram.intermediateMessageCatchEventId);

    const visibilityOfMessageEventSection: boolean = await propertyPanel.getVisibilityOfMessageEventSection();

    expect(visibilityOfMessageEventSection).toBeTruthy();
  });

  it('should show MessageEvent section after click on MessageSendEvent.', async() => {
    await diagramDetail.clickOnElement(diagram.intermediateMessageSendEventId);

    const visibilityOfMessageEventSection: boolean = await propertyPanel.getVisibilityOfMessageEventSection();

    expect(visibilityOfMessageEventSection).toBeTruthy();
  });

  it('should show MessageEvent section after click on MessageStartEvent.', async() => {
    await diagramDetail.clickOnElement(diagram.messageStartEventId);

    const visibilityOfMessageEventSection: boolean = await propertyPanel.getVisibilityOfMessageEventSection();

    expect(visibilityOfMessageEventSection).toBeTruthy();
  });

  it('should show MessageTask section after click on MessageReceiveTask.', async() => {
    await diagramDetail.clickOnElement(diagram.messageReceiveTaskId);

    const visibilityOfMessageTaskSection: boolean = await propertyPanel.getVisibilityOfMessageTaskSection();

    expect(visibilityOfMessageTaskSection).toBeTruthy();
  });

  it('should show MessageTask section after click on MessageSendTask.', async() => {
    await diagramDetail.clickOnElement(diagram.messageSendTaskId);

    const visibilityOfMessageTaskSection: boolean = await propertyPanel.getVisibilityOfMessageTaskSection();

    expect(visibilityOfMessageTaskSection).toBeTruthy();
  });

});
