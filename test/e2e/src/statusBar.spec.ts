import {browser, protractor, ProtractorExpectedConditions} from 'protractor';

import {Settings} from './pages/settings';
import {StatusBar} from './pages/statusBar';

fdescribe('Status bar', () => {
  let settings: Settings;
  let statusBar: StatusBar;

  const aureliaUrl: string = browser.params.aureliaUrl;
  const defaultTimeoutMS: number = browser.params.defaultTimeoutMS;

  const expectedConditions: ProtractorExpectedConditions = protractor.ExpectedConditions;

  beforeAll(() => {

    settings = new Settings();
    statusBar = new StatusBar();
  });

  beforeEach(() => {
    browser.get(aureliaUrl);
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(statusBar.statusBarTag), defaultTimeoutMS);
      return statusBar.statusBarTag;
    });
  });

  it('should display.', () => {
    statusBar.statusBarTag.isDisplayed().then((statusBarIsDisplayed: boolean) => {
      expect(statusBarIsDisplayed).toBeTruthy();
    });
  });

  it('should contain root and 3 elements (left-bar, center-bar, right bar).', () => {
    statusBar.statusBarContainer.isDisplayed().then((statusBarContainerIsDisplayed: boolean) => {
      expect(statusBarContainerIsDisplayed).toBeTruthy();
    });
    statusBar.statusBarContainerLeft.isDisplayed().then((statusBarContainerLeftIsDisplayed: boolean) => {
      expect(statusBarContainerLeftIsDisplayed).toBeTruthy();
    });
    statusBar.statusBarContainerCenter.isDisplayed().then((statusBarContainerCenterIsDisplayed: boolean) => {
      expect(statusBarContainerCenterIsDisplayed).toBeTruthy();
    });
    statusBar.statusBarContainerRight.isDisplayed().then((statusBarContainerRightIsDisplayed: boolean) => {
      expect(statusBarContainerRightIsDisplayed).toBeTruthy();
    });
  });

  it('should contain settings button.', () => {
    statusBar.statusBarSettingsButton.isDisplayed().then((statusBarSettingsButtonIsDisplayed: boolean) => {
      expect(statusBarSettingsButtonIsDisplayed).toBeTruthy();
    });
  });

  it('should be possible to click settings button and get redirected.', () => {
    statusBar.statusBarSettingsButton.click();
    browser.getCurrentUrl().then((currentBrowserUrl: string) => {
      expect(currentBrowserUrl).toMatch(settings.settingsLink);
    });
  });
});
