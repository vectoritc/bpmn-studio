import {browser} from 'protractor';

import {DiagramWithUserTask} from './diagrams/diagramWithUserTask';
import {RouterView} from './pages/routerView';
import {TaskList} from './pages/taskList';

describe('Task List', () => {

  let taskList: TaskList;
  let diagram: DiagramWithUserTask;
  let routerView: RouterView;

  const applicationUrl: string = browser.params.aureliaUrl;

  beforeAll(async() => {
    taskList = new TaskList(applicationUrl);
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
    await taskList.show();
  });

  it('should show the user task of the started process.', async() => {
    const visibilityOfListEntry: boolean = await taskList.getVisibilityOfListEntry(diagram.name);

    expect(visibilityOfListEntry).toBeTruthy();
  });

  it('should navigate to the `design view`, after clicking on the corresponding link in the table.', async() => {
    await taskList.clickOnDesignLink(diagram.name);

    const currentBrowserUrl: string = await browser.getCurrentUrl();
    expect(currentBrowserUrl).toContain(diagram.name);
  });

  it('should be able to continue user task with button click.', async() => {
    await taskList.clickOnContinueButton(diagram.name);

    const currentBrowserUrl: string = await browser.getCurrentUrl();
    expect(currentBrowserUrl).toContain(diagram.name);
  });

});
