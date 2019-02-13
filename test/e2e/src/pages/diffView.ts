import {browser, by, element, ElementFinder, ExpectedConditions} from 'protractor';

import {By} from 'selenium-webdriver';

export class DiffView {

  public url: string;

  private _diffViewContainerId: string = 'diagramDiffContainer';

  constructor(applicationUrl: string, diagramName: string) {
    this.url = `${applicationUrl}/design/diff/diagram/${diagramName}?solutionUri=http%3A%2F%2Flocalhost%3A8000`;
  }

  public async init(): Promise<void> {
    await browser.get(this.url);

    await browser.wait(ExpectedConditions.visibilityOf(this._diffViewContainer), browser.params.defaultTimeoutMS);
  }

  public async getVisibilityOfDiffViewContainer(): Promise<boolean> {
    await browser.wait(ExpectedConditions.visibilityOf(this._diffViewContainer), browser.params.defaultTimeoutMS);

    return this._diffViewContainer.isDisplayed();
  }

  private get _diffViewContainer(): ElementFinder {
    const diffViewContainerById: By = by.id(this._diffViewContainerId);

    return element(diffViewContainerById);
  }
}
