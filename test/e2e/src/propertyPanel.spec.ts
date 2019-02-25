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
});
