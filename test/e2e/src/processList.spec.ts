import {browser} from 'protractor';

import {DiagramWithUserTask} from './diagrams/diagramWithUserTask';
import {ProcessList} from './pages/processList';
import {RouterView} from './pages/routerView';

describe('Process List', () => {

  let processList: ProcessList;
  let diagram: DiagramWithUserTask;
  let routerView: RouterView;

  const applicationUrl: string = browser.params.aureliaUrl;

  beforeAll(async() => {
    processList = new ProcessList(applicationUrl);
    diagram = new DiagramWithUserTask();
    routerView = new RouterView();

    await diagram.deployDiagram();
    await diagram.startProcess();
  });

  afterAll(async() => {
    await diagram.deleteDiagram();
  });

  beforeEach(async() => {
    await routerView.show();
    await processList.show();
  });

  it('should show the started process.', async() => {
    const visibilityOfListEntry: boolean = await processList.getVisibilityOfListEntry(diagram.correlationId);

    expect(visibilityOfListEntry).toBeTruthy();
  });

  it('should navigate to the `design view`, after clicking on the corresponding link in the table.', async() => {
    await processList.clickOnDiagramDesignLink(diagram.correlationId);

    const currentBrowserUrl: string = await browser.getCurrentUrl();
    expect(currentBrowserUrl).toContain(diagram.name);
  });

  it('should navigate to the `task list`, after clicking on the corresponding link in the table.', async() => {
    await processList.clickOnUserTaskLink(diagram.correlationId);

    const currentBrowserUrl: string = await browser.getCurrentUrl();
    expect(currentBrowserUrl).toContain(diagram.processInstanceId);
  });

});
