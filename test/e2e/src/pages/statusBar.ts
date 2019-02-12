import {browser, by, element, ElementFinder, ExpectedConditions} from 'protractor';

import {By} from 'selenium-webdriver';

export class StatusBar {
  private _statusBarTag: string = 'status-bar';
  private _leftStatusBarContainerId: string = 'statusBarLeft';
  private _centerStatusBarContainerId: string = 'statusBarCenter';
  private _rightStatusBarContainerId: string = 'statusBarRight';
  private _enableXmlViewButtonId: string = 'statusBarXMLViewButton';
  private _disableXmlViewButtonId: string = 'statusBarDisableXMLViewButton';
  private _enableDiffViewButtonId: string = 'statusBarDiffViewButton';
  private _disableDiffViewButtonId: string = 'statusBarDisableDiffViewButton';

  public async init(): Promise<void> {
    const statusBarContainer: ElementFinder = this._statusBarContainer;

    await browser.wait(ExpectedConditions.visibilityOf(statusBarContainer), browser.params.defaultTimeoutMS);
  }

  public async getVisibilityOfLeftContainer(): Promise<boolean> {

    return this._leftStatusBarContainer.isDisplayed();
  }

  public async getVisibilityOfCenterContainer(): Promise<boolean> {

    return this._centerStatusBarContainer.isDisplayed();
  }

  public async getVisibilityOfRightContainer(): Promise<boolean> {

    return this._rightStatusBarContainer.isDisplayed();
  }

  public async getVisibilityOfEnableXmlViewButton(): Promise<boolean> {

    return this._enableXmlViewButton.isDisplayed();
  }

  public async clickOnEnableXmlViewButton(): Promise<void> {

    return this._enableXmlViewButton.click();
  }

  public async getVisibilityOfDisbaleXmlViewButton(): Promise<boolean> {

    return this._disableXmlViewButton.isDisplayed();
  }

  public async getVisibilityOfEnableDiffViewButton(): Promise<boolean> {

    return this._enableDiffViewButton.isDisplayed();
  }

  public async getVisibilityOfDisableDiffViewButton(): Promise<boolean> {

    return this._disableDiffViewButton.isDisplayed();
  }

  private get _statusBarContainer(): ElementFinder {
    const statusBarByTag: By = by.tagName(this._statusBarTag);

    return element(statusBarByTag);
  }

  private get _leftStatusBarContainer(): ElementFinder {
    const leftContainerById: By = by.id(this._leftStatusBarContainerId);

    return element(leftContainerById);
  }

  private get _centerStatusBarContainer(): ElementFinder {
    const centerContainerById: By = by.id(this._centerStatusBarContainerId);

    return element(centerContainerById);
  }

  private get _rightStatusBarContainer(): ElementFinder {
    const rightContainerById: By = by.id(this._rightStatusBarContainerId);

    return element(rightContainerById);
  }

  private get _enableXmlViewButton(): ElementFinder {
    const showXmlButtonById: By = by.id(this._enableXmlViewButtonId);

    return element(showXmlButtonById);
  }

  private get _disableXmlViewButton(): ElementFinder {
    const disabelXmlViewButtonById: By = by.id(this._disableXmlViewButtonId);

    return element(disabelXmlViewButtonById);
  }

  private get _enableDiffViewButton(): ElementFinder {
    const showDiffButtonById: By = by.id(this._enableDiffViewButtonId);

    return element(showDiffButtonById);
  }

}
