import {browser, by, element, ElementFinder, ExpectedConditions} from 'protractor';

import {By} from 'selenium-webdriver';

export class XmlView {

  public url: string;

  private _xmlViewContainerId: string = 'diagramXmlContainer';

  constructor(applicationUrl: string, diagramName: string) {
    this.url = `${applicationUrl}/design/xml/diagram/${diagramName}?solutionUri=http%3A%2F%2Flocalhost%3A8000`;
  }

  public async init(): Promise<void> {
    await browser.get(this.url);

    await browser.wait(ExpectedConditions.visibilityOf(this._xmlViewContainer), browser.params.defaultTimeoutMS);
  }

  public async getVisibilityOfXmlViewContainer(): Promise<boolean> {

    return this._xmlViewContainer.isDisplayed();
  }

  private get _xmlViewContainer(): ElementFinder {
    const xmlViewContainerById: By = by.id(this._xmlViewContainerId);

    return element(xmlViewContainerById);
  }
}
