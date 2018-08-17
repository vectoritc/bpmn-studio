import {by, element, ElementFinder} from 'protractor';

export class StatusBar {
  // Define Instances

  // Define Links, Urls, Classes
  public statusBarLink: string = '/processdef';
  public statusBarSettingsLink: string = 'configuration';

  // Define Class method call forwarding

  // Define Elements
  public statusBarTag: ElementFinder = element(by.tagName('status-bar'));
  public statusBarSettingsButton: ElementFinder = this.statusBarTag.element(by.id('statusBarSettingsButton'));
  public statusBarContainer: ElementFinder = this.statusBarTag.element(by.id('statusBarContainer'));
  public statusBarContainerLeft: ElementFinder = this.statusBarTag.element(by.id('statusBarLeftBar'));
  public statusBarContainerCenter: ElementFinder = this.statusBarTag.element(by.id('statusBarCenterBar'));
  public statusBarContainerRight: ElementFinder = this.statusBarTag.element(by.id('statusBarRightBar'));

  // Define Functions
}
