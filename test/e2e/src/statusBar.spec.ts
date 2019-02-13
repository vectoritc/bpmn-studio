import {browser} from 'protractor';

import {SimpleDiagram} from './diagrams/simpleDiagram';
import {DiagramDetail} from './pages/diagramDetail';
import {DiffView} from './pages/diffView';
import {RouterView} from './pages/routerView';
import {StatusBar} from './pages/statusBar';
import {XmlView} from './pages/xmlView';

describe('Status Bar', () => {

  let routerView: RouterView;
  let statusBar: StatusBar;
  let diagram: SimpleDiagram;
  let diagramDetail: DiagramDetail;
  let xmlView: XmlView;
  let diffView: DiffView;

  const applicationUrl: string = browser.params.aureliaUrl;

  beforeAll(async() => {
    routerView = new RouterView();
    statusBar = new StatusBar();
    diagram = new SimpleDiagram();
    diagramDetail = new DiagramDetail(applicationUrl, diagram.name);
    xmlView = new XmlView(applicationUrl, diagram.name);
    diffView = new DiffView(applicationUrl, diagram.name);
  });

  beforeEach(async() => {
    await routerView.init();
    await statusBar.init();
  });

  it('should contain left container.', async() => {
    const visibilityOfLeftContainer: boolean = await statusBar.getVisibilityOfLeftContainer();

    expect(visibilityOfLeftContainer).toBeTruthy();
  });

  it('should contain center container.', async() => {
    const visibilityOfCenterContainer: boolean = await statusBar.getVisibilityOfCenterContainer();

    expect(visibilityOfCenterContainer).toBeTruthy();
  });

  it('should contain right container.', async() => {
    const visibilityOfRightContainer: boolean = await statusBar.getVisibilityOfRightContainer();

    expect(visibilityOfRightContainer).toBeTruthy();
  });

  it('(on diagram detail) should show enable xml view button.', async() => {
    await diagramDetail.init();

    const visibilityOfEnableXmlViewButton: boolean = await statusBar.getVisibilityOfEnableXmlViewButton();

    expect(visibilityOfEnableXmlViewButton).toBeTruthy();
  });

  it('(on diagram detail) should show enable diff view button.', async() => {
    await diagramDetail.init();

    const visibilityOfEnableDiffViewButton: boolean = await statusBar.getVisibilityOfEnableDiffViewButton();

    expect(visibilityOfEnableDiffViewButton).toBeTruthy();
  });

  it('(on diagram detail) should show disable xml view button after click on enable xml view button.', async() => {
    await diagramDetail.init();

    await statusBar.clickOnEnableXmlViewButton();

    const visibilityOfDisableXmlViewButton: boolean = await statusBar.getVisibilityOfDisableXmlViewButton();

    expect(visibilityOfDisableXmlViewButton).toBeTruthy();
  });

  it('(on diagram detail) should show disable diff view button after click on enable diff view button.', async() => {
    await diagramDetail.init();

    await statusBar.clickOnEnableDiffViewButton();

    const visibilityOfDisableDiffViewButton: boolean = await statusBar.getVisibilityOfDisableDiffViewButton();

    expect(visibilityOfDisableDiffViewButton).toBeTruthy();
  });

  it('(on xml view) should show disable xml view button.', async() => {
    await xmlView.init();

    const visibilityOfDisableXmlViewButton: boolean = await statusBar.getVisibilityOfDisableXmlViewButton();

    expect(visibilityOfDisableXmlViewButton).toBeTruthy();
  });

  it('(on xml view) should show enable diff view button.', async() => {
    await xmlView.init();

    const visibilityOfEnableDiffViewButton: boolean = await statusBar.getVisibilityOfEnableDiffViewButton();

    expect(visibilityOfEnableDiffViewButton).toBeTruthy();
  });

  it('(on xml view) should show enable xml view button after lick on disbale xml view button', async() => {
    await xmlView.init();

    await statusBar.clickOnDisableXmlViewButton();

    const visibilityOfEnableXmlViewButton: boolean = await statusBar.getVisibilityOfEnableXmlViewButton();

    expect(visibilityOfEnableXmlViewButton).toBeTruthy();
  });

  it('(on diff view should show disable diff view button.', async() => {
    await diffView.init();

    const visibilityOfDisableDiffViewButton: boolean = await statusBar.getVisibilityOfDisableDiffViewButton();

    expect(visibilityOfDisableDiffViewButton).toBeTruthy();
  });

  it('(on diff view should show enable xml view button.', async() => {
    await diffView.init();

    const visibilityOfEnableXmlViewButton: boolean = await statusBar.getVisibilityOfEnableXmlViewButton();

    expect(visibilityOfEnableXmlViewButton).toBeTruthy();
  });

});
