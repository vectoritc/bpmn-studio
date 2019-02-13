import {
  browser,
  protractor,
  ProtractorExpectedConditions,
} from 'protractor';

import {SimpleDiagram} from './diagrams/simpleDiagram';
import {DiagramDetail} from './pages/diagramDetail';
import {RouterView} from './pages/routerView';
import {StatusBar} from './pages/statusBar';

describe('bpmn-io XML view', () => {

  let routerView: RouterView;
  let diagram: SimpleDiagram;
  let statusBar: StatusBar;
  let diagramDetail: DiagramDetail;

  const applicationUrl: string = browser.params.aureliaUrl;
  const defaultTimeoutMS: number = browser.params.defaultTimeoutMS;

  const expectedConditions: ProtractorExpectedConditions = protractor.ExpectedConditions;

  beforeAll(async() => {
    routerView = new RouterView();
    diagram = new SimpleDiagram();
    statusBar = new StatusBar();
    diagramDetail = new DiagramDetail(applicationUrl, diagram.name);

    await diagram.deployDiagram();
  });

  afterAll(async() => {

    await diagram.deleteDiagram();
  });

  beforeEach(async() => {
    await routerView.init();
    await diagramDetail.init();
  });

  it('should contain `Show XML` button in status bar.', async() => {
    const statusBarXMLViewButtonIsDisplayed: boolean = await statusBar.getVisibilityOfEnableXmlViewButton();

    expect(statusBarXMLViewButtonIsDisplayed).toBeTruthy();
  });

  it('should be possible to open xml view when click on `Show XML` button.', async() => {
    await statusBar.clickOnEnableXmlViewButton();

    const currentBrowserUrl: string = await browser.getCurrentUrl();

    expect(currentBrowserUrl).toBeTruthy('xml');
  });
});
