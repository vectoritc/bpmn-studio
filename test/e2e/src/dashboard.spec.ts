import {browser, protractor, ProtractorExpectedConditions} from 'protractor';

import {Dashboard} from './pages/dashboard';
import {General} from './pages/general';
import {ProcessModel} from './pages/processModel';

describe('Dashboard view', () => {

  let dashboard: Dashboard;
  let general: General;
  let processModel: ProcessModel;

  let processModelId: string;

  const aureliaUrl: string = browser.params.aureliaUrl;
  const defaultTimeoutMS: number = browser.params.defaultTimeoutMS;
  // tslint:disable-next-line:no-magic-numbers
  const taskListTimeoutMS: number = 2 * defaultTimeoutMS;

  const expectedConditions: ProtractorExpectedConditions = protractor.ExpectedConditions;

  beforeAll(() => {
    dashboard = new Dashboard();
    general = new General();
    processModel = new ProcessModel();

    processModelId = processModel.getProcessModelId();

    // Create a new process definition by POST REST call
    processModel.postProcessModelWithUserTask(processModelId);
  });

  beforeEach(() => {
    browser.get(aureliaUrl + dashboard.dashboardLink);
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(general.getRouterViewContainer), defaultTimeoutMS);
      return general.getRouterViewContainer;
    });
  });

  it('should contain process definitions.', () => {
      processModel.startProcess(processModelId);
  });

  // process list section

  it('should contain process list.', () => {
    dashboard.processListTag.isDisplayed().then((dashboardProcessListTagIsDisplayed: boolean) => {
      expect(dashboardProcessListTagIsDisplayed).toBeTruthy();
    });
  });

  it('should contain at least process definition in running section.', () => {
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(dashboard.firstProcessRunningListItems), defaultTimeoutMS);
      return dashboard.firstProcessRunningListItems;
    });

    dashboard.countOfProcessRunningListItems().then((countOfProcessRunningListItems: number) => {
      expect(countOfProcessRunningListItems).toBeGreaterThanOrEqual(1);
    });
  });

  it('should contain recently started process in running section.', () => {
    const correlationId: string = processModel.getCorrelationId();

    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(dashboard.firstProcessRunningListItemsById(correlationId)), defaultTimeoutMS);
      return dashboard.firstProcessRunningListItemsById(correlationId);
    });

    dashboard.countOfProcessRunningListItemsByCorrelationId(correlationId).then((countOfProcessRunningListItems: number) => {
      expect(countOfProcessRunningListItems).toBe(1);
    });
  });

  it('should be possible to open process model by click on hyperlink in table.', () => {
    const correlationId: string = processModel.getCorrelationId();

    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(
        dashboard.hyperlinkOfProcessRunningListItemByCorrelationId(correlationId)), defaultTimeoutMS);
      return dashboard.hyperlinkOfProcessRunningListItemByCorrelationId(correlationId);
    });
    dashboard.openProcessModelByClickOnModelIdInProcessRunningList(correlationId).then(() => {
      browser.getCurrentUrl().then((currentBrowserUrl: string) => {
        expect(currentBrowserUrl).toContain(processModel.processModelUrl(correlationId));
      });
    });
  });

  it('should be possible to open user tasks by click on hyperlink in table.', () => {
    const correlationId: string = processModel.getCorrelationId();

    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(
        dashboard.hyperlinkOfUserTasksInProcessRunningListItemByCorrelationId(correlationId)), defaultTimeoutMS);
      return dashboard.hyperlinkOfUserTasksInProcessRunningListItemByCorrelationId(correlationId);
    });
    dashboard.openUserTasksByClickOnModelIdInProcessRunningList(correlationId).then(() => {
      browser.getCurrentUrl().then((currentBrowserUrl: string) => {
        expect(currentBrowserUrl).toContain(processModel.userTasksUrl(processModelId));
      });
    });
  });

  it('should contain task list.', () => {
    dashboard.taskListContainer.isDisplayed().then((dashboardTaskListContainer: boolean) => {
      expect(dashboardTaskListContainer).toBeTruthy();
    });
  });

  // task list section

  it('should contain at least task definition in tasks waiting section.', () => {
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(dashboard.firstTaskListItems), taskListTimeoutMS);
      return dashboard.firstTaskListItems;
    });

    dashboard.countOfTasksWaitingListItems().then((countOfTasksWaitingListItems: number) => {
      expect(countOfTasksWaitingListItems).toBeGreaterThanOrEqual(1);
    });
  });

  it('should contain recently started task in tasks waiting section.', () => {
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(dashboard.firstTaskWaitingById(processModelId)), taskListTimeoutMS);
      return dashboard.firstTaskWaitingById(processModelId);
    });

    dashboard.countOfTasksWaitingListItemsById(processModelId).then((countOfTasksWaitingListItemsById: number) => {
      expect(countOfTasksWaitingListItemsById).toBe(1);
    });
  });

  it('should be possbible to click continue in task waiting section.', () => {
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(dashboard.firstTaskWaitingById(processModelId)), taskListTimeoutMS);
      return dashboard.firstTaskWaitingById(processModelId);
    });

    dashboard.continueTaskByClickOnButton(processModelId).then(() => {
      browser.getCurrentUrl().then((currentBrowserUrl: string) => {
        expect(currentBrowserUrl).toContain(processModel.userTasksInputUrl(processModel.getProcessModelId()));
      });
    });
  });

  it('should be possbible to click continue in an opened user task.', () => {
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(dashboard.firstTaskWaitingById(processModelId)), taskListTimeoutMS);
      return dashboard.firstTaskWaitingById(processModelId);
    });

    dashboard.continueTaskByClickOnButton(processModelId);

    // Wait until view is loaded and button is visible
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(dashboard.dynamicUiWrapperContinueButton), taskListTimeoutMS);
      return dashboard.dynamicUiWrapperContinueButton;
    });
  });

  it('should be in waiting room when click continue in an opened user task.', () => {
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(dashboard.firstTaskWaitingById(processModelId)), taskListTimeoutMS);
      return dashboard.firstTaskWaitingById(processModelId);
    });

    dashboard.continueTaskByClickOnButton(processModelId);

    // Wait until view is loaded and button is visible
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(dashboard.dynamicUiWrapperContinueButton), taskListTimeoutMS);
      return dashboard.dynamicUiWrapperContinueButton;
    });

    // Should be in waiting room
    dashboard.continueUserTaskByClickOnDynamicUiWrapperContinuButton().then(() => {
      browser.getCurrentUrl().then((currentBrowserUrl: string) => {
        expect(currentBrowserUrl).toContain(processModel.waitingroomUrl(processModelId, processModel.getCorrelationId()));
      });
    });

    // Should be in dashboard view
    browser.driver.wait(() => {
      browser.wait(expectedConditions.urlContains(dashboard.dashboardLink), taskListTimeoutMS);
      return dashboard.dashboardLink;
    });
  });
});
