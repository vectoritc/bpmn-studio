import {browser, ElementFinder, protractor, ProtractorExpectedConditions} from 'protractor';

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
    const dashboardLink: string = dashboard.dashboardLink;
    const routerViewContainer: ElementFinder = general.getRouterViewContainer;

    browser.get(aureliaUrl + dashboardLink);
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(routerViewContainer), defaultTimeoutMS);
      return routerViewContainer;
    });
  });

  it('should contain process definitions.', () => {
      processModel.startProcess(processModelId);
  });

  // process list section

  it('should contain process list.', () => {
    const processListTag: ElementFinder = dashboard.processListTag;

    processListTag
    .isDisplayed()
    .then((dashboardProcessListTagIsDisplayed: boolean) => {
      expect(dashboardProcessListTagIsDisplayed).toBeTruthy();
    });
  });

  it('should contain at least process definition in running section.', () => {
    const firstProcessRunningListItems: ElementFinder = dashboard.firstProcessRunningListItems;

    browser.driver
    .wait(() => {
      browser
      .wait(expectedConditions
        .visibilityOf(firstProcessRunningListItems), defaultTimeoutMS);
      return firstProcessRunningListItems;
    });

    dashboard.countOfProcessRunningListItems()
    .then((countOfProcessRunningListItems: number) => {
      expect(countOfProcessRunningListItems).toBeGreaterThanOrEqual(1);
    });
  });

  it('should contain recently started process in running section.', () => {
    const correlationId: string = processModel.getCorrelationId();
    const firstProcessRunningListItemsById: ElementFinder = dashboard.firstProcessRunningListItemsById(correlationId);

    browser.driver
    .wait(() => {
      browser
      .wait(expectedConditions
        .visibilityOf(firstProcessRunningListItemsById), defaultTimeoutMS);
      return firstProcessRunningListItemsById;
    });

    const countOfProcessRunningListItemsByCorrelationId: Promise<number> = dashboard.countOfProcessRunningListItemsByCorrelationId(correlationId);

    countOfProcessRunningListItemsByCorrelationId
    .then((countOfProcessRunningListItems: number) => {
      expect(countOfProcessRunningListItems).toBe(1);
    });
  });

  it('should be possible to open process model by click on hyperlink in table.', () => {
    const correlationId: string = processModel.getCorrelationId();
    const hyperlinkOfProcessRunningListItemByCorrelationId: ElementFinder = dashboard.hyperlinkOfProcessRunningListItemByCorrelationId(correlationId);

    browser.driver
    .wait(() => {
      browser
      .wait(expectedConditions
        .visibilityOf(
        hyperlinkOfProcessRunningListItemByCorrelationId), defaultTimeoutMS);
      return hyperlinkOfProcessRunningListItemByCorrelationId;
    });

    const openProcessModelByClickOnModelIdInProcessRunningList: any = dashboard.openProcessModelByClickOnModelIdInProcessRunningList(correlationId);
    const processModelUrl: string = processModel.processModelUrl(processModelId);

    openProcessModelByClickOnModelIdInProcessRunningList
    .then(() => {
      browser
      .getCurrentUrl()
      .then((currentBrowserUrl: string) => {
        expect(currentBrowserUrl).toContain(processModelUrl);
      });
    });
  });

  it('should be possible to open user tasks by click on hyperlink in table.', () => {
    const correlationId: string = processModel.getCorrelationId();
    const hyperlinkOfUserTasksInProcessRunningListItemByCorrelationId: ElementFinder
            = dashboard.hyperlinkOfUserTasksInProcessRunningListItemByCorrelationId(correlationId);

    browser.driver
    .wait(() => {
      browser
      .wait(expectedConditions
        .visibilityOf(hyperlinkOfUserTasksInProcessRunningListItemByCorrelationId), defaultTimeoutMS);
      return hyperlinkOfUserTasksInProcessRunningListItemByCorrelationId;
    });

    const openUserTasksByClickOnModelIdInProcessRunningList: any = dashboard.openUserTasksByClickOnModelIdInProcessRunningList(correlationId);
    const userTasksUrl: string = processModel.userTasksUrl(processModelId);

    openUserTasksByClickOnModelIdInProcessRunningList
    .then(() => {
      browser
      .getCurrentUrl()
      .then((currentBrowserUrl: string) => {
        expect(currentBrowserUrl).toContain(userTasksUrl);
      });
    });
  });

  it('should contain task list.', () => {
    const taskListContainer: ElementFinder = dashboard.taskListContainer;

    taskListContainer
    .isDisplayed()
    .then((dashboardTaskListContainer: boolean) => {
      expect(dashboardTaskListContainer).toBeTruthy();
    });
  });

  // task list section

  it('should contain at least task definition in tasks waiting section.', () => {
    const firstTaskListItems: ElementFinder = dashboard.firstTaskListItems;

    browser.driver
    .wait(() => {
      browser
      .wait(expectedConditions
        .visibilityOf(firstTaskListItems), taskListTimeoutMS);
      return firstTaskListItems;
    });

    const countOfTasksWaitingListItem: Promise<number> = dashboard.countOfTasksWaitingListItems();

    countOfTasksWaitingListItem
    .then((countOfTasksWaitingListItems: number) => {
      expect(countOfTasksWaitingListItems).toBeGreaterThanOrEqual(1);
    });
  });

  it('should contain recently started task in tasks waiting section.', () => {
    const firstTaskWaitingById: ElementFinder = dashboard.firstTaskWaitingById(processModelId);

    browser.driver
    .wait(() => {
      browser
      .wait(expectedConditions
        .visibilityOf(firstTaskWaitingById), taskListTimeoutMS);
      return firstTaskWaitingById;
    });

    const countOfTasksWaitingListItemsById: Promise<number> = dashboard.countOfTasksWaitingListItemsById(processModelId);

    countOfTasksWaitingListItemsById
    .then((countOfTasksWaitingListItemsByIds: number) => {
      expect(countOfTasksWaitingListItemsByIds).toBe(1);
    });
  });

  it('should be possbible to click continue in task waiting section.', () => {
    const firstTaskWaitingById: ElementFinder = dashboard.firstTaskWaitingById(processModelId);

    browser.driver
    .wait(() => {
      browser
      .wait(expectedConditions
        .visibilityOf(firstTaskWaitingById), taskListTimeoutMS);
      return firstTaskWaitingById;
    });

    const continueTaskByClickOnButton: any = dashboard.continueTaskByClickOnButton(processModelId);
    const userTasksInputUrl: string = processModel.userTasksInputUrl(processModelId);

    continueTaskByClickOnButton
    .then(() => {
      browser
      .getCurrentUrl()
      .then((currentBrowserUrl: string) => {
        expect(currentBrowserUrl).toContain(userTasksInputUrl);
      });
    });
  });

  it('should be possbible to click continue in an opened user task.', () => {
    const firstTaskWaitingById: ElementFinder = dashboard.firstTaskWaitingById(processModelId);

    browser.driver
    .wait(() => {
      browser
      .wait(expectedConditions
        .visibilityOf(firstTaskWaitingById), taskListTimeoutMS);
      return firstTaskWaitingById;
    });

    dashboard.continueTaskByClickOnButton(processModelId);

    const dynamicUiWrapperContinueButton: ElementFinder = dashboard.dynamicUiWrapperContinueButton;

    // Wait until view is loaded and button is visible
    browser.driver
    .wait(() => {
      browser
      .wait(expectedConditions
        .visibilityOf(dynamicUiWrapperContinueButton), taskListTimeoutMS);
      return dynamicUiWrapperContinueButton;
    });
  });

  it('should be in waiting room when click continue in an opened user task.', () => {
    const firstTaskWaitingById: ElementFinder = dashboard.firstTaskWaitingById(processModelId);

    browser.driver
    .wait(() => {
      browser
      .wait(expectedConditions
        .visibilityOf(firstTaskWaitingById), taskListTimeoutMS);
      return firstTaskWaitingById;
    });

    dashboard.continueTaskByClickOnButton(processModelId);

    const dynamicUiWrapperContinueButton: ElementFinder = dashboard.dynamicUiWrapperContinueButton;

    // Wait until view is loaded and button is visible
    browser.driver
    .wait(() => {
      browser
      .wait(expectedConditions
        .visibilityOf(dynamicUiWrapperContinueButton), taskListTimeoutMS);
      return dynamicUiWrapperContinueButton;
    });

    const correlationId: string = processModel.getCorrelationId();
    const waitingroomUrl: string = processModel.waitingroomUrl(processModelId, correlationId);

    // Should be in waiting room
    dashboard
    .continueUserTaskByClickOnDynamicUiWrapperContinuButton()
    .then(() => {
      browser
      .getCurrentUrl()
      .then((currentBrowserUrl: string) => {
        expect(currentBrowserUrl).toContain(waitingroomUrl);
      });
    });

    const dashboardLink: string = dashboard.dashboardLink;

    // Should be in dashboard view
    browser.driver
    .wait(() => {
      browser
      .wait(expectedConditions.urlContains(dashboardLink), taskListTimeoutMS);
      return dashboardLink;
    });
  });
});
