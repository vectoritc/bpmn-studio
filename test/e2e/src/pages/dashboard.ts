import {browser, by, element, ElementFinder, ExpectedConditions} from 'protractor';

import {By} from 'selenium-webdriver';

export class Dashboard {
  public url: string;

  private _dashboardContainerId: string = 'dashboardContainer';
  private _processListContainerId: string = 'processListContainer';
  private _taskListContainerId: string = 'taskListContainer';

  constructor(applicationUrl: string) {
    this.url = `${applicationUrl}/inspect/dashboard`;
  }

  public async init(): Promise<void> {
    await browser.get(this.url);
    browser.wait(ExpectedConditions.visibilityOf(this._dashboardContainer), browser.params.defaultTimeoutMS);
  }

  public async openProcessModelByClickOnModelIdInProcessRunningList(correlationId: string): promise.Promise<void> {
    const hyperlinkOfProcessRunningListItemByCorrelationId: ElementFinder = this.hyperlinkOfProcessRunningListItemByCorrelationId(correlationId);

    return hyperlinkOfProcessRunningListItemByCorrelationId.click();
  }

  public hyperlinkOfUserTasksInProcessRunningListItemByCorrelationId(correlationId: string): ElementFinder {
    const byClassName: By = this._byProcessListItemUserTasks;
    const firstProcessRunningListItemsById: ElementFinder = this.firstProcessRunningListItemsById(correlationId);

    return firstProcessRunningListItemsById
            .element(byClassName);
  }

  public openUserTasksByClickOnModelIdInProcessRunningList(correlationId: string): promise.Promise<void> {
    const hyperlinkOfUserTasksInProcessRunningListItemByCorrelationId: ElementFinder
          = this.hyperlinkOfUserTasksInProcessRunningListItemByCorrelationId(correlationId);

    return hyperlinkOfUserTasksInProcessRunningListItemByCorrelationId.click();
  }

  // task list section
  public firstTaskWaitingById(processId: string): ElementFinder {
    const id: string = this._domTaskIdPrefix + processId;
    const byId: By = by.id(id);

    return this.taskListContainer
            .all(byId)
            .first();
  }

  public async countOfTasksWaitingListItems(): Promise<number> {
    return this.taskListContainer
            .all(this._byDomTaskClassName)
            .count();
  }
  public async countOfTasksWaitingListItemsById(processModelId: string): Promise<number> {
    const id: string = this._domTaskIdPrefix + processModelId;
    const byId: By = by.id(id);

    return this.taskListContainer
            .all(byId)
            .count();
  }

  public continueTaskByClickOnButton(processModelId: string): promise.Promise<void> {
    const firstTaskWaitingById: ElementFinder = this.firstTaskWaitingById(processModelId);
    const taskListContinueButton: ElementFinder = firstTaskWaitingById.element(this._byTaskListContinueButton);

    return taskListContinueButton.click();
  }

  // user task section
  public continueUserTaskByClickOnDynamicUiWrapperContinueButton(): promise.Promise<void> {
    return this.dynamicUiWrapperContinueButton.click();
  }
}
