import {
  by,
  element,
  ElementFinder,
} from 'protractor';

import {By} from 'selenium-webdriver';

export class StatusBar {

  // Define Links, Urls, Classes
  public statusBarLink: string = '/processdef';
  public statusBarActiveClassName: string = 'status-bar__element--active';

  // Define Elements
  private _byTagName: By = by.tagName('status-bar');
  private _byStatusBarSettingsButton: By = by.id('statusBarSettingsButton');
  private _byStatusBarContainer: By = by.id('statusBarContainer');
  private _byStatusBarLeft: By = by.id('statusBarLeft');
  private _byStatusBarCenter: By = by.id('statusBarCenter');
  private _byStatusBarRight: By = by.id('statusBarRight');
  private _byStatusBarXMLViewButton: By = by.id('statusBarXMLViewButton');
  private _byStatusBarDiffViewButton: By = by.id('statusBarDiffViewButton');
  private _byStatusBarDisableDiffViewButton: By = by.id('statusBarDisableDiffViewButton');
  private _byStatusBarPreviousVsCurrentButton: By = by.id('statusBarPreviousVsCurrent');
  private _byStatusBarCurrentVsPreviousButton: By = by.id('statusBarCurrentVsPrevious');
  private _byStatusBarChangesLogButton: By = by.id('statusBarChangesLog');

  public statusBarTag: ElementFinder = element(this._byTagName);
  public statusBarSettingsButton: ElementFinder = this.statusBarTag.element(this._byStatusBarSettingsButton);
  public statusBarContainer: ElementFinder = this.statusBarTag.element(this._byStatusBarContainer);
  public statusBarContainerLeft: ElementFinder = this.statusBarTag.element(this._byStatusBarLeft);
  public statusBarContainerCenter: ElementFinder = this.statusBarTag.element(this._byStatusBarCenter);
  public statusBarContainerRight: ElementFinder = this.statusBarTag.element(this._byStatusBarRight);
  public statusBarXMLViewButton: ElementFinder = this.statusBarTag.element(this._byStatusBarXMLViewButton);
  public statusBarDiffViewButton: ElementFinder = this.statusBarTag.element(this._byStatusBarDiffViewButton);
  public statusBarDisableDiffViewButton: ElementFinder = this.statusBarTag.element(this._byStatusBarDisableDiffViewButton);
  public statusBarPreviousVsCurrentButton: ElementFinder = this.statusBarTag.element(this._byStatusBarPreviousVsCurrentButton);
  public statusBarCurrentVsPreviousButton: ElementFinder = this.statusBarTag.element(this._byStatusBarCurrentVsPreviousButton);
  public statusBarChangesLogButton: ElementFinder = this.statusBarTag.element(this._byStatusBarChangesLogButton);

  // Define Function
  public async statusBarButtonIsEnabled(statusBarButton: ElementFinder): Promise<boolean> {
    const statusBarButtonClass: string = await statusBarButton.getAttribute('class');
    return statusBarButtonClass.includes(this.statusBarActiveClassName);
  }

}
