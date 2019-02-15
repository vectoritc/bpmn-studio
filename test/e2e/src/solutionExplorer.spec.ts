import {
  browser,
  ElementFinder,
  protractor,
  ProtractorExpectedConditions,
} from 'protractor';

import {SimpleDiagram} from './diagrams/simpleDiagram';
import {RouterView} from './pages/routerView';
import {SolutionExplorer} from './pages/solutionExplorer';

describe('Solution Explorer', () => {

  let solutionExplorer: SolutionExplorer;
  let diagram: SimpleDiagram;
  let routerView: RouterView;

  beforeAll(async() => {

    solutionExplorer = new SolutionExplorer();
    diagram = new SimpleDiagram();
    routerView = new RouterView();

    await diagram.deployDiagram();
  });

  afterAll(async() => {
    await diagram.deleteDiagram();
  });

  beforeEach(async() => {
    await routerView.show();
    await solutionExplorer.show();
  });

  it('should display the deployed diagram.', async() => {
    const diagramIsVisible: boolean = await solutionExplorer.getVisibilityOfDiagramEntry(diagram.name);

    expect(diagramIsVisible).toBeTruthy();
  });

  it('should navigate to the `design view`, after clicking on the diagram name.', async() => {
    await solutionExplorer.openDiagramByClick(diagram.name);

    const currentBrowserUrl: string = await browser.getCurrentUrl();

    expect(currentBrowserUrl).toContain(diagram.name);
  });
});
