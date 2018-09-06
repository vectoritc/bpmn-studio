import {by, element, ElementArrayFinder, ElementFinder} from 'protractor';

export class NavBar {

  // Define Links, Urls, Classes
  public navBarDisabledClassName: string = 'menu-tabbed-link--disabled';
  public navBarSolutionExplorerActiveClassName: string = 'solution-explorer--active';

  // Define Elements
  public navBarTag: ElementFinder = element(by.tagName('nav-bar'));
  public navBarSettingsButton: ElementFinder = this.navBarTag.element(by.id('navBarSettingsButton'));
  public navBarContainer: ElementFinder = this.navBarTag.element(by.id('navBarContainer'));
  public navBarContainerLeft: ElementFinder = this.navBarTag.element(by.id('navBarLeft'));
  public navBarContainerCenter: ElementFinder = this.navBarTag.element(by.id('navBarCenter'));
  public navBarContainerRight: ElementFinder = this.navBarTag.element(by.id('navBarRight'));
  public navBarLogInButton: ElementFinder = this.navBarTag.element(by.id('userLoginButton'));

  public navBarSolutionExplorerButton: ElementFinder = this.navBarTag.element(by.id('navbarSolutionExplorerButton'));
  public navBarActiveSolutionExplorer: ElementArrayFinder = this.navBarTag.all(by.className('solution-explorer--active'));

  public navBarThinkLink: ElementFinder = this.navBarTag.element(by.id('navbarThinkLink'));
  public navBarDesignLink: ElementFinder = this.navBarTag.element(by.id('navbarDesignLink'));
  public navBarInspectLink: ElementFinder = this.navBarTag.element(by.id('navbarInspectLink'));

  // Define Functions
  public openSolutionExplorerByButtonClick(): void {
    this.navBarSolutionExplorerButton.click();
  }

}
