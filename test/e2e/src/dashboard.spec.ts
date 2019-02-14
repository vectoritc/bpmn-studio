import {
  browser,
  ElementFinder,
  protractor,
  ProtractorExpectedConditions,
} from 'protractor';

import {DiagramWithUserTask} from './diagrams/diagramWithUserTask';
import {Dashboard} from './pages/dashboard';
import {RouterView} from './pages/routerView';

describe('Dashboard', () => {

  let dashboard: Dashboard;
  let diagram: DiagramWithUserTask;
  let routerView: RouterView;

  const applicationUrl: string = browser.params.aureliaUrl;
  const defaultTimeoutMS: number = browser.params.defaultTimeoutMS;

  const expectedConditions: ProtractorExpectedConditions = protractor.ExpectedConditions;

  beforeAll(async() => {
    dashboard = new Dashboard(applicationUrl);
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
    await dashboard.show();
  });

  it('should contain the process list.', async() => {
    const visibilityOfProcessListContainer: boolean = await dashboard.getVisibilityOfProcessListContainer();

    expect(visibilityOfProcessListContainer).toBeTruthy();
  });

  it('should contain the task list.', async() => {
    const visibilityOfTaskListContainer: boolean = await dashboard.getVisibilityOfTaskListContainer();

    expect(visibilityOfTaskListContainer).toBeTruthy();
  });
});
