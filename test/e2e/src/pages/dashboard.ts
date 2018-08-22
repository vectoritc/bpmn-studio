import {by, element, ElementArrayFinder, ElementFinder} from 'protractor';

export class Dashboard {

  // Define Links, Urls, Classes
  public dashboardLink: string = '/dashboard';
  private _domProcessIdPrefix: string = 'processList-';
  private _domProcessClassName: string = 'process-list-item';

  private _domTaskIdPrefix: string = 'taskList-';
  private _domTaskClassName: string = 'task-list-item';

  // Define Elements
  public processListTag: ElementFinder = element(by.tagName('process-list'));
  public processRunningListItems: ElementArrayFinder = this.processListTag.all(by.className(this._domProcessClassName));
  public firstProcessRunningListItems: ElementFinder = this.processListTag.all(by.className(this._domProcessClassName)).first();

  public taskListContainer: ElementFinder = element(by.id('taskListContainer'));
  public firstTaskListItems: ElementFinder = this.taskListContainer.all(by.className(this._domTaskClassName)).first();

  public dynamicUiWrapperContinueButton: ElementFinder = element(by.id('dynamic-ui-wrapper-continue-button'));

  // Define Functions
  public processRunningListItemById(correlationId: string): ElementArrayFinder {
    return this.processListTag.all(by.id(this._domProcessIdPrefix + correlationId));
  }
  public async countOfProcessRunningListItems(): Promise<number> {
    return this.processListTag.all(by.className(this._domProcessClassName)).count();
  }
  public async countOfProcessRunningListItemsByCorrelationId(correlationId: string): Promise<number> {
    return await this.processListTag.all(by.id(this._domProcessIdPrefix + correlationId)).count();
  }
  public firstProcessRunningListItemsById(correlationId: string): ElementFinder {
    return this.processListTag.all(by.id(this._domProcessIdPrefix + correlationId)).first();
  }

  public hyperlinkOfProcessRunningListItemByCorrelationId(correlationId: string): ElementFinder {
    return this.firstProcessRunningListItemsById(correlationId).element(by.className('process-list-item-model-id'));
  }
  public openProcessModelByClickOnModelIdInProcessRunningList(correlationId: string): any {
    return this.hyperlinkOfProcessRunningListItemByCorrelationId(correlationId).click();
  }

  public hyperlinkOfUserTasksInProcessRunningListItemByCorrelationId(correlationId: string): ElementFinder {
    return this.firstProcessRunningListItemsById(correlationId).element(by.className('process-list-item-user-tasks'));
  }
  public openUserTasksByClickOnModelIdInProcessRunningList(correlationId: string): any {
    return this.hyperlinkOfUserTasksInProcessRunningListItemByCorrelationId(correlationId).click();
  }

  // task list section
  public firstTaskWaitingById(processId: string): ElementFinder {
    return this.taskListContainer.all(by.id(this._domTaskIdPrefix + processId)).first();
  }

  public async countOfTasksWaitingListItems(): Promise<number> {
    return this.taskListContainer.all(by.className(this._domTaskClassName)).count();
  }
  public async countOfTasksWaitingListItemsById(processModelId: string): Promise<number> {
    return this.taskListContainer.all(by.id(this._domTaskIdPrefix + processModelId)).count();
  }

  public continueTaskByClickOnButton(processModelId: string): any {
    return this.firstTaskWaitingById(processModelId).element(by.className('task-list-continue-button')).click();
  }

  // user task section
  public continueUserTaskByClickOnDynamicUiWrapperContinuButton(): any {
    return this.dynamicUiWrapperContinueButton.click();
  }
}
