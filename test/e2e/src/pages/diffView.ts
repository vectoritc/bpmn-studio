import {browser, by, element, ElementArrayFinder, ElementFinder, ExpectedConditions} from 'protractor';

import {By} from 'selenium-webdriver';

const diffAgainstOtherDiagramButtonId: string = 'diffAgainstOtherDiagramButton';
const diffViewContainerId: string = 'diagramDiffContainer';
const chooseDiagramModalId: string = 'chooseDiagramModal';
const diagramDropdownId: string = 'diagramDropdown';

export class DiffView {

  public url: string;

  constructor(applicationUrl: string, diagramName: string) {
    this.url = `${applicationUrl}/design/diff/diagram/${diagramName}?solutionUri=http%3A%2F%2Flocalhost%3A8000`;
  }

  public async show(): Promise<void> {
    await browser.get(this.url);

    await browser.wait(ExpectedConditions.visibilityOf(this._diffViewContainer), browser.params.defaultTimeoutMS);
  }

  public async getVisibilityOfDiffViewContainer(): Promise<boolean> {
    await browser.wait(ExpectedConditions.visibilityOf(this._diffViewContainer), browser.params.defaultTimeoutMS);

    return this._diffViewContainer.isDisplayed();
  }

  public async getVisibilityOfDiffAgainstOtherDiagramButton(): Promise<boolean> {
    await browser.wait(ExpectedConditions.visibilityOf(this._diffAgainstOtherDiagramButton), browser.params.defaultTimeoutMS);

    return this._diffAgainstOtherDiagramButton.isDisplayed();
  }

  public clickOnDiffAgainstOtherDiagramButton(): void {
    this._diffAgainstOtherDiagramButton.click();
  }

  public async getVisibilityOfChooseDiagramModal(): Promise<boolean> {
    await browser.wait(ExpectedConditions.visibilityOf(this._chooseDiagramModal), browser.params.defaultTimeoutMS);

    return this._chooseDiagramModal.isDisplayed();
  }

  public async getVisibilityOfDiagramDropdown(): Promise<boolean> {
    await browser.wait(ExpectedConditions.visibilityOf(this._diagramDropdown), browser.params.defaultTimeoutMS);

    return this._diagramDropdown.isDisplayed();
  }

  public async getDropdownOptions(): Promise<any> {
    this._diagramDropdown.all(by.tagName('option')).then((options: Array<Element> ) => {
      console.log(options[0].id);
    });

    return this._diagramDropdown.all(by.tagName('option'));
  }

  private get _diffViewContainer(): ElementFinder {
    const diffViewContainerById: By = by.id(diffViewContainerId);

    return element(diffViewContainerById);
  }

  private get _diffAgainstOtherDiagramButton(): ElementFinder {
    const diffAgainstOtherDiagramButtonById: By = by.id(diffAgainstOtherDiagramButtonId);

    return element(diffAgainstOtherDiagramButtonById);
  }

  private get _chooseDiagramModal(): ElementFinder {
    const chooseDiagramModalById: By = by.id(chooseDiagramModalId);

    return element(chooseDiagramModalById);
  }

  private get _diagramDropdown(): ElementFinder {
    const diagramDropdownById: By = by.id(diagramDropdownId);

    return element(diagramDropdownById);
  }
}
