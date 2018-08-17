import {by, element, ElementFinder} from 'protractor';

export class StatusBar {

  public statusBarLink: string = '/processdef';
  public statusBarSettingsLink: string = 'configuration';

  public statusBarTag: ElementFinder = element(by.tagName('status-bar'));
  public statusBarSettingsButton: ElementFinder = this.statusBarTag.element(by.id('statusBarSettingsButton'));
  public statusBarContainer: ElementFinder = this.statusBarTag.element(by.id('statusBarContainer'));
  public statusBarContainerLeft: ElementFinder = this.statusBarTag.element(by.id('statusBarLeftBar'));
  public statusBarContainerCenter: ElementFinder = this.statusBarTag.element(by.id('statusBarCenterBar'));
  public statusBarContainerRight: ElementFinder = this.statusBarTag.element(by.id('statusBarRightBar'));
}
