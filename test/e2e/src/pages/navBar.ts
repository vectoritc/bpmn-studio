import {by, element, ElementArrayFinder, ElementFinder} from 'protractor';
import {By, promise} from 'selenium-webdriver';

export class NavBar {

  // Define Links, Urls, Classes
  public navBarDisabledClassName: string = 'menu-tabbed-link--disabled';
  public navBarSolutionExplorerActiveClassName: string = 'solution-explorer--active';

  // Define Elements
  private byTagName: By = by.tagName('nav-bar');
  private byStatusBarContainer: By = by.id('navBarContainer');
  private byStatusBarLeft: By = by.id('navBarLeft');
  private byStatusBarCenter: By = by.id('navBarCenter');
  private byStatusBarRight: By = by.id('navBarRight');
  private byLoginButton: By = by.id('userLoginButton');
  private bySolutionExplorerButton: By = by.id('navbarSolutionExplorerButton');
  private byActiveSolutionExplorer: By = by.className('solution-explorer--active');
  private byThinkLink: By = by.id('navbarThinkLink');
  private byDesignLink: By = by.id('navbarDesignLink');
  private byInspectLink: By = by.id('navbarInspectLink');

  public navBarTag: ElementFinder = element(this.byTagName);
  public navBarContainer: ElementFinder = this.navBarTag.element(this.byStatusBarContainer);
  public navBarContainerLeft: ElementFinder = this.navBarTag.element(this.byStatusBarLeft);
  public navBarContainerCenter: ElementFinder = this.navBarTag.element(this.byStatusBarCenter);
  public navBarContainerRight: ElementFinder = this.navBarTag.element(this.byStatusBarRight);
  public navBarLogInButton: ElementFinder = this.navBarTag.element(this.byLoginButton);

  public navBarSolutionExplorerButton: ElementFinder = this.navBarTag.element(this.bySolutionExplorerButton);
  public navBarActiveSolutionExplorer: ElementArrayFinder = this.navBarTag.all(this.byActiveSolutionExplorer);

  public navBarThinkLink: ElementFinder = this.navBarTag.element(this.byThinkLink);
  public navBarDesignLink: ElementFinder = this.navBarTag.element(this.byDesignLink);
  public navBarInspectLink: ElementFinder = this.navBarTag.element(this.byInspectLink);

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
