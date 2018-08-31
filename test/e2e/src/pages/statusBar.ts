import {by, element, ElementFinder} from 'protractor';
import {By} from 'selenium-webdriver';

export class StatusBar {

  // Define Links, Urls, Classes
  public statusBarLink: string = '/processdef';

  // Define Elements
  private byTagName: By = by.tagName('status-bar');
  private byStatusBarSettingsButton: By = by.id('statusBarSettingsButton');
  private byStatusBarContainer: By = by.id('statusBarContainer');
  private byStatusBarLeft: By = by.id('statusBarLeft');
  private byStatusBarCenter: By = by.id('statusBarCenter');
  private byStatusBarRight: By = by.id('statusBarRight');
  private byStatusBarXMLViewButton: By = by.id('statusBarXMLViewButton');

  public statusBarTag: ElementFinder = element(this.byTagName);
  public statusBarSettingsButton: ElementFinder = this.statusBarTag.element(this.byStatusBarSettingsButton);
  public statusBarContainer: ElementFinder = this.statusBarTag.element(this.byStatusBarContainer);
  public statusBarContainerLeft: ElementFinder = this.statusBarTag.element(this.byStatusBarLeft);
  public statusBarContainerCenter: ElementFinder = this.statusBarTag.element(this.byStatusBarCenter);
  public statusBarContainerRight: ElementFinder = this.statusBarTag.element(this.byStatusBarRight);
  public statusBarXMLViewButton: ElementFinder = this.statusBarTag.element(this.byStatusBarXMLViewButton);

}
