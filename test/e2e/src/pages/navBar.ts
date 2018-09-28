import {
  by,
  element,
  ElementArrayFinder,
  ElementFinder,
} from 'protractor';

import {
  By,
  promise,
} from 'selenium-webdriver';

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
  private _byThinkLink: By = by.id('navbarThinkLink');
  private _byDesignLink: By = by.id('navbarDesignLink');
  private _byInspectLink: By = by.id('navbarInspectLink');
  private _byNavbarExportButton: By = by.id('navbarExportDiagram');
  private _byNavbarExportAsBPMNButton: By = by.id('navbarExportDiagramAsBPMN');
  private _byNavbarExportAsJPEGButton: By = by.id('navbarExportDiagramAsJPEG');
  private _byNavbarExportAsPNGButton: By = by.id('navbarExportDiagramAsPNG');
  private _byNavbarExportAsSVGButton: By = by.id('navbarExportDiagramAsSVG');

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

  public navbarExportButton: ElementFinder = this.navBarTag.element(this._byNavbarExportButton);
  public navbarExportAsBPMNButton: ElementFinder = this.navBarTag.element(this._byNavbarExportAsBPMNButton);
  public navbarExportAsJPEGButton: ElementFinder = this.navBarTag.element(this._byNavbarExportAsJPEGButton);
  public navbarExportAsSVGButton: ElementFinder = this.navBarTag.element(this._byNavbarExportAsSVGButton);
  public navbarExportAsPNGButton: ElementFinder = this.navBarTag.element(this._byNavbarExportAsPNGButton);

  // Define Functions
  public openSolutionExplorerByButtonClick(): promise.Promise<void> {
    return this.navBarSolutionExplorerButton.click();
  }

  public async navBarButtonIsDisabled(button: ElementFinder): Promise<boolean> {
    const navBarButtonAttributes: string = await button.getAttribute('class');
    const containsDisabledAttribute: boolean = navBarButtonAttributes.includes(this.navBarDisabledClassName);

    return !containsDisabledAttribute;
  }

  public async clickAtNavbarExportButton(): promise.Promise<void> {
    return this.navbarExportButton.click();
  }

  public async clickAtNavbarExportAsSVGButton(): promise.Promise<void> {
    return this.navbarExportAsSVGButton.click();
  }

  public async clickAtNavbarExportAsJPEGButton(): promise.Promise<void> {
    return this.navbarExportAsJPEGButton.click();
  }

}
