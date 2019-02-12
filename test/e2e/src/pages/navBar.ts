import {browser, by, element, ElementFinder, ExpectedConditions} from 'protractor';

import {By} from 'selenium-webdriver';

export class NavBar {

  // Define Links, Urls, Classes
  public navBarDisabledClassName: string = 'menu-tabbed-link--disabled';

  // Define Elements
  private _byTagName: By = by.tagName('nav-bar');
  private _byStatusBarContainer: By = by.id('navBarContainer');
  private _byStatusBarLeft: By = by.id('navBarLeft');
  private _byStatusBarCenter: By = by.id('navBarCenter');
  private _byStatusBarRight: By = by.id('navBarRight');
  private _byLoginButton: By = by.id('userLoginButton');
  private _bySolutionExplorerButton: By = by.id('navbarSolutionExplorerButton');
  private _byActiveButton: By = by.css('#navbarSolutionExplorerButton.button--active');
  private _byThinkLink: By = by.id('navbarThink');
  private _byDesignLink: By = by.id('navbarDesign');
  private _byInspectLink: By = by.id('navbarInspect');

  public navBarTag: ElementFinder = element(this._byTagName);
  public navBarContainer: ElementFinder = this.navBarTag.element(this._byStatusBarContainer);
  public navBarContainerLeft: ElementFinder = this.navBarTag.element(this._byStatusBarLeft);
  public navBarContainerCenter: ElementFinder = this.navBarTag.element(this._byStatusBarCenter);
  public navBarContainerRight: ElementFinder = this.navBarTag.element(this._byStatusBarRight);
  public navBarLogInButton: ElementFinder = this.navBarTag.element(this._byLoginButton);

  public navBarSolutionExplorerButton: ElementFinder = this.navBarTag.element(this._bySolutionExplorerButton);
  public navBarActiveSolutionExplorer: ElementArrayFinder = this.navBarTag.all(this._byActiveButton);

  public navBarThinkLink: ElementFinder = this.navBarTag.element(this._byThinkLink);
  public navBarDesignLink: ElementFinder = this.navBarTag.element(this._byDesignLink);
  public navBarInspectLink: ElementFinder = this.navBarTag.element(this._byInspectLink);

  // Define Functions
  public openSolutionExplorerByButtonClick(): promise.Promise<void> {
    return this.navBarSolutionExplorerButton.click();
  }

  public async navBarButtonIsDisabled(button: ElementFinder): Promise<boolean> {
    const navBarButtonAttributes: string = await button.getAttribute('class');
    const containsDisabledAttribute: boolean = navBarButtonAttributes.includes(this.navBarDisabledClassName);

    return !containsDisabledAttribute;
  }

}
