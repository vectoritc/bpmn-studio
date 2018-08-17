import {NavBar} from './pages/navBar';

import {browser, protractor, ProtractorExpectedConditions} from 'protractor';

describe('Navigation bar', () => {
  const navBar: NavBar = new NavBar();

  const aureliaUrl: string = browser.params.aureliaUrl;
  const defaultTimeoutMS: number = browser.params.defaultTimeoutMS;

  const expectedConditions: ProtractorExpectedConditions = protractor.ExpectedConditions;

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

  // This section is about login button
  it('should contain login button.', () => {
    navBar.navBarLogInButton.isDisplayed().then((navBarLogInButtonIsDisplayed: boolean) => {
      expect(navBarLogInButtonIsDisplayed).toBeTruthy();
    });
  });

  // This section is about solution explorer button
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

  // This section is about plan button
  it('should contain plan button.', () => {
    navBar.navBarPlanLink.isDisplayed().then((navBarPlanLinkIsDisplayed: boolean) => {
      expect(navBarPlanLinkIsDisplayed).toBeTruthy();
    });
  });

  it('should contain an enabled plan view button.', () => {
    navBar.navBarPlanLink.getAttribute('class').then((classAttribute: string) => {
      expect(classAttribute).not.toContain(navBar.navBarDisabledClassName);
    });
  });

  it('should open process list view when plan button is clicked.', () => {
    navBar.navBarPlanLink.click().then(() => {
      browser.getCurrentUrl().then((currentBrowserUrl: string) => {
        expect(currentBrowserUrl).toContain(navBar.processModelLink);
      });
    });
  });

  // This section is about design button
  it('should contain design button.', () => {
    navBar.navBarDesignLink.isDisplayed().then((navBarDesignLinkIsDisplayed: boolean) => {
      expect(navBarDesignLinkIsDisplayed).toBeTruthy();
    });
  });

  it('should contain an disabled design view button.', () => {
    navBar.navBarDesignLink.getAttribute('class').then((classAttribute: string) => {
      expect(classAttribute).toContain(navBar.navBarDisabledClassName);
    });
  });

  // This section is about publish button
  it('should contain publish button.', () => {
    navBar.navBarPublishLink.isDisplayed().then((navBarPublishLinkIsDisplayed: boolean) => {
      expect(navBarPublishLinkIsDisplayed).toBeTruthy();
    });
  });

  it('should contain an disabled design view button.', () => {
    navBar.navBarPublishLink.getAttribute('class').then((classAttribute: string) => {
      expect(classAttribute).toContain(navBar.navBarDisabledClassName);
    });
  });

  // This section is about dashboard button
  it('should contain dashboard button.', () => {
    navBar.navBarDashboardLink.isDisplayed().then((navBarDashboardLinkIsDisplayed: boolean) => {
      expect(navBarDashboardLinkIsDisplayed).toBeTruthy();
    });
  });

  it('should contain an enabled dashboard view button.', () => {
    navBar.navBarDashboardLink.getAttribute('class').then((classAttribute: string) => {
      expect(classAttribute).not.toContain(navBar.navBarDisabledClassName);
    });
  });

  it('should open dashboard view when dashboard button is clicked.', () => {
    navBar.navBarDashboardLink.click().then(() => {
      browser.getCurrentUrl().then((currentBrowserUrl: string) => {
        expect(currentBrowserUrl).toContain(navBar.dashboardLink);
      });
    });
  });

});
