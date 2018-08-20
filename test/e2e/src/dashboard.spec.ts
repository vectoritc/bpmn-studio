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
  const taskListTimeoutMS: number = defaultTimeoutMS + defaultTimeoutMS;

  const expectedConditions: ProtractorExpectedConditions = protractor.ExpectedConditions;

  beforeAll(() => {
    dashboard = new Dashboard();
    general = new General();
    processModel = new ProcessModel();

    // Get processModelId
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
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(dashboard.firstProcessRunningListItemsById(processModel.getCorrelationId())), defaultTimeoutMS);
      return dashboard.firstProcessRunningListItemsById(processModel.getCorrelationId());
    });

    dashboard.countOfProcessRunningListItemsByCorrelationId(processModel.getCorrelationId()).then((countOfProcessRunningListItems: number) => {
      expect(countOfProcessRunningListItems).toBe(1);
    });
  });

  it('should be possible to open process model by click on hyperlink in table.', () => {
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(
        dashboard.hyperlinkOfProcessRunningListItemByCorrelationId(processModel.getCorrelationId())), defaultTimeoutMS);
      return dashboard.hyperlinkOfProcessRunningListItemByCorrelationId(processModel.getCorrelationId());
    });
    dashboard.openProcessModelByClickOnModelIdInProcessRunningList(processModel.getCorrelationId()).then(() => {
      browser.getCurrentUrl().then((currentBrowserUrl: string) => {
        expect(currentBrowserUrl).toContain(processModel.processModelUrl(processModel.getProcessModelId()));
      });
    });
  });

  it('should be possible to open user tasks by click on hyperlink in table.', () => {
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(
        dashboard.hyperlinkOfUserTasksInProcessRunningListItemByCorrelationId(processModel.getCorrelationId())), defaultTimeoutMS);
      return dashboard.hyperlinkOfUserTasksInProcessRunningListItemByCorrelationId(processModel.getCorrelationId());
    });
    dashboard.openUserTasksByClickOnModelIdInProcessRunningList(processModel.getCorrelationId()).then(() => {
      browser.getCurrentUrl().then((currentBrowserUrl: string) => {
        expect(currentBrowserUrl).toContain(processModel.userTasksUrl(processModel.getProcessModelId()));
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
