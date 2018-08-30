import {browser, ElementFinder, protractor, ProtractorExpectedConditions} from 'protractor';
import {promise} from 'selenium-webdriver';

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
    const visibilityOfRouterViewContainer: Function = expectedConditions.visibilityOf(routerViewContainer);

    browser.get(aureliaUrl + dashboardLink);
    browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfRouterViewContainer, defaultTimeoutMS);
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
    const visibilityOfFirstProcessRunningListItems: Function = expectedConditions.visibilityOf(firstProcessRunningListItems);

    browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfFirstProcessRunningListItems, defaultTimeoutMS);
        return firstProcessRunningListItems;
      });

    const countOfProcessRunningListItem: Promise<number> = dashboard.countOfProcessRunningListItems();

    countOfProcessRunningListItem
      .then((countOfProcessRunningListItems: number) => {
        expect(countOfProcessRunningListItems).toBeGreaterThanOrEqual(1);
      });
  });

  it('should contain recently started process in running section.', () => {
    const correlationId: string = processModel.getCorrelationId();
    const firstProcessRunningListItemsById: ElementFinder = dashboard.firstProcessRunningListItemsById(correlationId);
    const visibilityOfFirstProcessRunningListItemsById: Function = expectedConditions.visibilityOf(firstProcessRunningListItemsById);

    browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfFirstProcessRunningListItemsById, defaultTimeoutMS);
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
    const visibilityOfHyperlinkOfProcessRunningListItemByCorrelationId: Function = 
      expectedConditions.visibilityOf(hyperlinkOfProcessRunningListItemByCorrelationId);

    browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfHyperlinkOfProcessRunningListItemByCorrelationId, defaultTimeoutMS);
        return hyperlinkOfProcessRunningListItemByCorrelationId;
     });

    const openProcessModelByClickOnModelIdInProcessRunningList: promise.Promise<void> =
      dashboard.openProcessModelByClickOnModelIdInProcessRunningList(correlationId);
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
    const hyperlinkOfUserTasksInProcessRunningListItemByCorrelationId: ElementFinder =
      dashboard.hyperlinkOfUserTasksInProcessRunningListItemByCorrelationId(correlationId);
    const visibilityOfHyperlinkOfUserTasksInProcessRunningListItemByCorrelationId: Function =
      expectedConditions.visibilityOf(hyperlinkOfUserTasksInProcessRunningListItemByCorrelationId);

    browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfHyperlinkOfUserTasksInProcessRunningListItemByCorrelationId, defaultTimeoutMS);
        return hyperlinkOfUserTasksInProcessRunningListItemByCorrelationId;
      });

    const openUserTasksByClickOnModelIdInProcessRunningList: promise.Promise<void> =
      dashboard.openUserTasksByClickOnModelIdInProcessRunningList(correlationId);
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
      .then((dashboardTaskListContainerIsDisplayed: boolean) => {
        expect(dashboardTaskListContainerIsDisplayed).toBeTruthy();
      });
  });

  // task list section

  it('should contain at least task definition in tasks waiting section.', () => {
    const firstTaskListItems: ElementFinder = dashboard.firstTaskListItems;
    const visibilityOfFirstTaskListItems: Function = expectedConditions.visibilityOf(firstTaskListItems);

    browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfFirstTaskListItems, taskListTimeoutMS);
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
    const visibilityOfFirstTaskWaitingById: Function = expectedConditions.visibilityOf(firstTaskWaitingById);

    browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfFirstTaskWaitingById, taskListTimeoutMS);
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
    const visibilityOfFirstTaskWaitingById: Function = expectedConditions.visibilityOf(firstTaskWaitingById);

    browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfFirstTaskWaitingById, taskListTimeoutMS);
        return firstTaskWaitingById;
      });

    const continueTaskByClickOnButton: promise.Promise<void> = dashboard.continueTaskByClickOnButton(processModelId);
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
    const visibilityOfFirstTaskWaitingById: Function = expectedConditions.visibilityOf(firstTaskWaitingById);

    browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfFirstTaskWaitingById, taskListTimeoutMS);
        return firstTaskWaitingById;
      });

    dashboard.continueTaskByClickOnButton(processModelId);

    const dynamicUiWrapperContinueButton: ElementFinder = dashboard.dynamicUiWrapperContinueButton;
    const visibilityOfDynamicUiWrapperContinueButton: Function = expectedConditions.visibilityOf(dynamicUiWrapperContinueButton);

    // Wait until view is loaded and button is visible
    browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfDynamicUiWrapperContinueButton, taskListTimeoutMS);
        return dynamicUiWrapperContinueButton;
      });
  });

  it('should be in waiting room when click continue in an opened user task.', () => {
    const firstTaskWaitingById: ElementFinder = dashboard.firstTaskWaitingById(processModelId);
    const visibilityOfFirstTaskWaitingById: Function = expectedConditions.visibilityOf(firstTaskWaitingById);

    browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfFirstTaskWaitingById, taskListTimeoutMS);
        return firstTaskWaitingById;
      });

    dashboard.continueTaskByClickOnButton(processModelId);

    const dynamicUiWrapperContinueButton: ElementFinder = dashboard.dynamicUiWrapperContinueButton;
    const visibilityOfDynamicUiWrapperContinueButton: Function = expectedConditions.visibilityOf(dynamicUiWrapperContinueButton);

    // Wait until view is loaded and button is visible
    browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfDynamicUiWrapperContinueButton, taskListTimeoutMS);
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
    const urlContainsDashboardLink: Function = expectedConditions.urlContains(dashboardLink);

    // Should be in dashboard view
    browser.driver
    .wait(() => {
      browser
      .wait(urlContainsDashboardLink, taskListTimeoutMS);
      return dashboardLink;
    });
  });
});
