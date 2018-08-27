import {browser, protractor, ProtractorExpectedConditions} from 'protractor';

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
    browser.get(aureliaUrl);
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(navBar.navBarTag), defaultTimeoutMS);
      return navBar.navBarTag;
    });
  });

  it('should display.', () => {
    navBar.navBarTag.isDisplayed().then((navBarIsDisplayed: boolean) => {
      expect(navBarIsDisplayed).toBeTruthy();
    });
  });

  it('should contain root and 3 elements (left-bar, center-bar, right bar)', () => {
    navBar.navBarContainer.isDisplayed().then((navBarContainerIsDisplayed: boolean) => {
      expect(navBarContainerIsDisplayed).toBeTruthy();
    });
    navBar.navBarContainerLeft.isDisplayed().then((navBarContainerLeftIsDisplayed: boolean) => {
      expect(navBarContainerLeftIsDisplayed).toBeTruthy();
    });
    navBar.navBarContainerCenter.isDisplayed().then((navBarContainerCenterIsDisplayed: boolean) => {
      expect(navBarContainerCenterIsDisplayed).toBeTruthy();
    });
    navBar.navBarContainerRight.isDisplayed().then((navBarContainerRightIsDisplayed: boolean) => {
      expect(navBarContainerRightIsDisplayed).toBeTruthy();
    });
  });

  // This section tests the login button
  it('should contain login button.', () => {
    navBar.navBarLogInButton.isDisplayed().then((navBarLogInButtonIsDisplayed: boolean) => {
      expect(navBarLogInButtonIsDisplayed).toBeTruthy();
    });
  });

  // This section tests the solution explorer button
  it('should contain solution explorer button.', () => {
    navBar.navBarSolutionExplorerButton.isDisplayed().then((navBarSolutionExplorerButtonIsDisplayed: boolean) => {
      expect(navBarSolutionExplorerButtonIsDisplayed).toBeTruthy();
    });
  });

  it('should contain an enabled solution explorer button.', () => {
    navBar.navBarSolutionExplorerButton.getAttribute('class').then((classAttribute: string) => {
      expect(classAttribute).not.toContain(navBar.navBarDisabledClassName);
    });
  });

  it('should contain an highlighted solution explorer button when clicked.', () => {
    navBar.navBarSolutionExplorerButton.click().then(() => {
      navBar.navBarActiveSolutionExplorer.count().then((numberOfActiveSolutionExplorers: number) => {
        expect(numberOfActiveSolutionExplorers).toBe(1);
      });
    });
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
