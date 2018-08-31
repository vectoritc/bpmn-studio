import {browser, ElementArrayFinder, ElementFinder, protractor, ProtractorExpectedConditions} from 'protractor';

import {Dashboard} from './pages/dashboard';
import {NavBar} from './pages/navBar';
import {ProcessModel} from './pages/processModel';

describe('Navigation bar', () => {
  let dashboard: Dashboard;
  let navBar: NavBar;
  let processModel: ProcessModel;

  const aureliaUrl: string = browser.params.aureliaUrl;
  const defaultTimeoutMS: number = browser.params.defaultTimeoutMS;

  const expectedConditions: ProtractorExpectedConditions = protractor.ExpectedConditions;

  beforeAll(() => {
    dashboard = new Dashboard();
    navBar = new NavBar();
    processModel = new ProcessModel();
  });

  beforeEach(() => {
    const navBarTag: ElementFinder = navBar.navBarTag;
    const visibilityOfNavBarTag: Function = expectedConditions.visibilityOf(navBarTag);

    browser.get(aureliaUrl);
    browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfNavBarTag, defaultTimeoutMS);
        return navBarTag;
      });
  });

  it('should display.', async() => {
    const navBarTag: ElementFinder = navBar.navBarTag;
    const navBarTagIsDisplayed: boolean = await navBarTag.isDisplayed();

    expect(navBarTagIsDisplayed).toBeTruthy();
  });

  it('should contain root and 3 elements (left-bar, center-bar, right bar)', async() => {
    const navBarContainer: ElementFinder = navBar.navBarContainer;
    const navBarContainerIsDisplayed: boolean = await navBarContainer.isDisplayed();

    expect(navBarContainerIsDisplayed).toBeTruthy();

    const navBarContainerLeft: ElementFinder = navBar.navBarContainerLeft;
    const navBarContainerLeftIsDisplayed: boolean = await navBarContainerLeft.isDisplayed();

    expect(navBarContainerLeftIsDisplayed).toBeTruthy();

    const navBarContainerCenter: ElementFinder = navBar.navBarContainerCenter;
    const navBarContainerCenterIsDisplayed: boolean = await navBarContainerCenter.isDisplayed();

    expect(navBarContainerCenterIsDisplayed).toBeTruthy();

    const navBarContainerRight: ElementFinder = navBar.navBarContainerRight;
    const navBarContainerRightIsDisplayed: boolean = await navBarContainerRight.isDisplayed();

    expect(navBarContainerRightIsDisplayed).toBeTruthy();
  });

  // This section tests the login button
  it('should contain login button.', async() => {
    const navBarLogInButton: ElementFinder = navBar.navBarLogInButton;
    const navBarLogInButtonIsDisplayed: boolean = await navBarLogInButton.isDisplayed();

    expect(navBarLogInButtonIsDisplayed).toBeTruthy();
  });

  // This section tests the solution explorer button
  it('should contain solution explorer button.', async() => {
    const navBarSolutionExplorerButton: ElementFinder = navBar.navBarSolutionExplorerButton;
    const navBarSolutionExplorerButtonIsDisplayed: boolean = await navBarSolutionExplorerButton.isDisplayed();

    expect(navBarSolutionExplorerButtonIsDisplayed).toBeTruthy();
  });

  it('should contain an enabled solution explorer button.', async() => {
    const navBarSolutionExplorerButtonAttributes: boolean = await navBar.navBarSolutionExplorerButtonIsDisabled();

    expect(navBarSolutionExplorerButtonAttributes).toBeTruthy();
  });

  it('should contain an highlighted solution explorer button when clicked.', async() => {
    const navBarSolutionExplorerButton: ElementFinder = navBar.navBarSolutionExplorerButton;

    await navBarSolutionExplorerButton.click();

    const navBarActiveSolutionExplorer: ElementArrayFinder = navBar.navBarActiveSolutionExplorer;
    const numberOfActiveSolutionExplorers: number = await navBarActiveSolutionExplorer.count();

    expect(numberOfActiveSolutionExplorers).toBe(1);
  });

  // This section tests the think button
  it('should contain think button.', () => {
    navBar.navBarThinkLink.isDisplayed().then((navBarThinkLinkIsDisplayed: boolean) => {
      expect(navBarThinkLinkIsDisplayed).toBeTruthy();
    });
  });

  it('should contain an enabled think view button.', () => {
    navBar.navBarThinkLink.getAttribute('class').then((classAttribute: string) => {
      expect(classAttribute).not.toContain(navBar.navBarDisabledClassName);
    });
  });

  it('should open process list view when think button is clicked.', () => {
    navBar.navBarThinkLink.click().then(() => {
      browser.getCurrentUrl().then((currentBrowserUrl: string) => {
        expect(currentBrowserUrl).toContain(processModel.getProcessModelLink());
      });
    });
  });

  // This section tests the design button
  it('should contain design button.', () => {
    navBar.navBarDesignLink.isDisplayed().then((navBarDesignLinkIsDisplayed: boolean) => {
      expect(navBarDesignLinkIsDisplayed).toBeTruthy();
    });
  });

  it('should contain a disabled design view button.', () => {
    navBar.navBarDesignLink.getAttribute('class').then((classAttribute: string) => {
      expect(classAttribute).toContain(navBar.navBarDisabledClassName);
    });
  });

  // This section tests the inspect button
  it('should contain inspect button.', () => {
    navBar.navBarInspectLink.isDisplayed().then((navBarInspectLinkIsDisplayed: boolean) => {
      expect(navBarInspectLinkIsDisplayed).toBeTruthy();
    });
  });

  it('should contain an enabled inspect view button.', () => {
    navBar.navBarInspectLink.getAttribute('class').then((classAttribute: string) => {
      expect(classAttribute).not.toContain(navBar.navBarDisabledClassName);
    });
  });

  it('should open inspect view when the inspect button is clicked.', () => {
    navBar.navBarInspectLink.click().then(() => {
      browser.getCurrentUrl().then((currentBrowserUrl: string) => {
        expect(currentBrowserUrl).toContain(dashboard.dashboardLink);
      });
    });
  });

});
