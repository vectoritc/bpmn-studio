import {browser, by, element, ElementFinder, ExpectedConditions} from 'protractor';

import {By} from 'selenium-webdriver';

export class TaskList {
  public url: string;

  private _listEntryIdentifier: string = 'taskList-';
  private _taskListContainerId: string = 'taskListContainer';
  private _diagramLinkClassName: string = 'task-list-item-modelname';
  private _continueButtonClassName: string = 'task-list-continue-button';

  constructor(applicationUrl: string) {
    this.url = `${applicationUrl}/task`;
  }

  public async init(): Promise<void> {
    await browser.get(this.url);

    browser.wait(ExpectedConditions.visibilityOf(this._taskListContainer), browser.params.defaultTimeoutMS);
  }

  public async getVisibilityOfTaskListContainer(): Promise<boolean> {

    return this._taskListContainer.isDisplayed();
  }

  public async getVisibilityOfListEntry(diagramName: string): Promise<boolean> {
    const listEntry: ElementFinder = this._getListEntry(diagramName);

    return listEntry.isDisplayed();
  }

  public async getVisibilityOfDesignLink(diagramName: string): Promise<boolean> {
    const designLink: ElementFinder = this._getDiagramDesignLink(diagramName);

    return designLink.isDisplayed();
  }

  public async clickOnDesignLink(diagramName: string): Promise<void> {
    const designLink: ElementFinder = this._getDiagramDesignLink(diagramName);

    return designLink.click();
  }

  public async getVisbilityOfContinueButton(diagramName: string): Promise<boolean> {
    const continueButton: ElementFinder = this._getContinueButton(diagramName);

    return continueButton.isDisplayed();
  }

  public async clickOnContinueButton(diagramName: string): Promise<void> {
    const continueButton: ElementFinder = this._getContinueButton(diagramName);

    return continueButton.click();
  }

  private get _taskListContainer(): ElementFinder {
    const taskListContainerById: By = by.id(this._taskListContainerId);

    return element(taskListContainerById);
  }

  private _getListEntry(diagramName: string): ElementFinder {
    const listEntryId: string = `${this._listEntryIdentifier}${diagramName}`;
    const listEntryById: By = by.id(listEntryId);

    return element(listEntryById);
  }

  private _getDiagramDesignLink(diagramName: string): ElementFinder {
    const listEntryId: string = `${this._listEntryIdentifier}${diagramName}`;
    const listEntryById: By = by.id(listEntryId);
    const diagramLinkByTag: By = by.className(this._diagramLinkClassName);

    return element(listEntryById).all(diagramLinkByTag).first();
  }

  private _getContinueButton(diagramName: string): ElementFinder {
    const listEntryId: string = `${this._listEntryIdentifier}${diagramName}`;
    const listEntryById: By = by.id(listEntryId);
    const diagramLinkByTag: By = by.className(this._continueButtonClassName);

    return element(listEntryById).all(diagramLinkByTag).first();
  }

}
