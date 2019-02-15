import {browser} from 'protractor';

import {SimpleDiagram} from './diagrams/simpleDiagram';
import {DiagramDetail} from './pages/diagramDetail';
import {DiffView} from './pages/diffView';
import {RouterView} from './pages/routerView';
import {StatusBar} from './pages/statusBar';
import {XmlView} from './pages/xmlView';

describe('Design view', () => {

  let routerView: RouterView;
  let diagram: SimpleDiagram;
  let statusBar: StatusBar;
  let diagramDetail: DiagramDetail;
  let xmlView: XmlView;
  let diffView: DiffView;

  const applicationUrl: string = browser.params.aureliaUrl;

  beforeAll(async() => {
    routerView = new RouterView();
    diagram = new SimpleDiagram();
    statusBar = new StatusBar();
    diagramDetail = new DiagramDetail(applicationUrl, diagram.name);
    xmlView = new XmlView(applicationUrl, diagram.name);
    diffView = new DiffView(applicationUrl, diagram.name);

    await diagram.deployDiagram();
  });

  afterAll(async() => {
    await diagram.deleteDiagram();
  });

  beforeEach(async() => {
    await routerView.show();
  });

  it('should show the `detail view` after navigating to it.', async() => {
    await diagramDetail.show();

    const visibilityOfDiagramDetailContainer: boolean = await diagramDetail.getVisibilityOfDiagramDetailContainer();

    expect(visibilityOfDiagramDetailContainer).toBeTruthy();
  });

  it('should show the `xml view` after navigating to it.', async() => {
    await xmlView.show();

    const visibilityOfXmlViewContainer: boolean = await xmlView.getVisibilityOfXmlViewContainer();

    expect(visibilityOfXmlViewContainer).toBeTruthy();
  });

  it('should show the `diff view` after navigating to it.', async() => {
    await diffView.show();

    const visibilityOfDiffViewContainer: boolean = await diffView.getVisibilityOfDiffViewContainer();

    expect(visibilityOfDiffViewContainer).toBeTruthy();
  });

  it('should show the `xml view` after clicking on the button in the status bar.', async() => {
    await diagramDetail.show();
    await statusBar.show();

    await statusBar.clickOnEnableXmlViewButton();

    const visibilityOfXmlViewContainer: boolean = await xmlView.getVisibilityOfXmlViewContainer();

    expect(visibilityOfXmlViewContainer).toBeTruthy();
  });

  it('should show detail view again when currently showing the xml view and clicking on button in status bar.', async() => {
    await xmlView.show();
    await statusBar.show();

    await statusBar.clickOnDisableXmlViewButton();

    const visibilityOfDiagramDetailContainer: boolean = await diagramDetail.getVisibilityOfDiagramDetailContainer();

    expect(visibilityOfDiagramDetailContainer).toBeTruthy();
  });

  it('should show diff view after click on button in status bar.', async() => {
    await diagramDetail.show();
    await statusBar.show();

    await statusBar.clickOnEnableDiffViewButton();

    const visibilityOfDiffViewContainer: boolean = await diffView.getVisibilityOfDiffViewContainer();

    expect(visibilityOfDiffViewContainer).toBeTruthy();
  });

  it('should show detail view again after when currently showing the diff view and clicking on button in status bar.', async() => {
    await diffView.show();
    await statusBar.show();

    await statusBar.clickOnDisableDiffViewButton();

    const visibilityOfDiagramDetailContainer: boolean = await diagramDetail.getVisibilityOfDiagramDetailContainer();

    expect(visibilityOfDiagramDetailContainer).toBeTruthy();
  });
});
