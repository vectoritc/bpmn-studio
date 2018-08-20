import {by, element, ElementFinder} from 'protractor';

export class StatusBar {

  // Define Links, Urls, Classes
  public statusBarLink: string = '/processdef';

  // Define Elements
  public statusBarTag: ElementFinder = element(by.tagName('status-bar'));
  public statusBarSettingsButton: ElementFinder = this.statusBarTag.element(by.id('statusBarSettingsButton'));
  public statusBarContainer: ElementFinder = this.statusBarTag.element(by.id('statusBarContainer'));
  public statusBarContainerLeft: ElementFinder = this.statusBarTag.element(by.id('statusBarLeft'));
  public statusBarContainerCenter: ElementFinder = this.statusBarTag.element(by.id('statusBarCenter'));
  public statusBarContainerRight: ElementFinder = this.statusBarTag.element(by.id('statusBarRight'));

}
