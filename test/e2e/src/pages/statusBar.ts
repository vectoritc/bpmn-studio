import {
  by,
  element,
  ElementFinder,
} from 'protractor';

import {By} from 'selenium-webdriver';

export class StatusBar {

  // Define Elements
  private _byTagName: By = by.tagName('status-bar');
  private _byStatusBarSettingsButton: By = by.id('statusBarSettingsButton');
  private _byStatusBarContainer: By = by.id('statusBarContainer');
  private _byStatusBarLeft: By = by.id('statusBarLeft');
  private _byStatusBarCenter: By = by.id('statusBarCenter');
  private _byStatusBarRight: By = by.id('statusBarRight');
  private _byStatusBarXMLViewButton: By = by.id('statusBarXMLViewButton');

  public statusBarTag: ElementFinder = element(this._byTagName);
  public statusBarSettingsButton: ElementFinder = this.statusBarTag.element(this._byStatusBarSettingsButton);
  public statusBarContainer: ElementFinder = this.statusBarTag.element(this._byStatusBarContainer);
  public statusBarContainerLeft: ElementFinder = this.statusBarTag.element(this._byStatusBarLeft);
  public statusBarContainerCenter: ElementFinder = this.statusBarTag.element(this._byStatusBarCenter);
  public statusBarContainerRight: ElementFinder = this.statusBarTag.element(this._byStatusBarRight);
  public statusBarXMLViewButton: ElementFinder = this.statusBarTag.element(this._byStatusBarXMLViewButton);

}
