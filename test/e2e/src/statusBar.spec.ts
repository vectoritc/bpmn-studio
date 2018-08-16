import {browser, by, element, ElementFinder, protractor, ProtractorExpectedConditions} from 'protractor';
import { StatusBar } from './pages/statusBar';

describe('status-bar', () => {
  const aureliaUrl: string = browser.params.aureliaUrl;
  const defaultTimeoutMS: number = browser.params.defaultTimeoutMS;

  const expectedConditions: ProtractorExpectedConditions = protractor.ExpectedConditions;
  const statusBar: StatusBar = new StatusBar();

  browser.driver.manage().deleteAllCookies();

  beforeEach(() => {
    browser.get(aureliaUrl);
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(statusBar.statusBarTag), defaultTimeoutMS);
      return statusBar.statusBarTag;
    });
  });

  it('should display', () => {
    statusBar.statusBarTag.isDisplayed().then((result: boolean) => {
      expect(result).toBeTruthy();
    });
  });

  it('should contain root and 3 elements (left-bar, center-bar, right bar)', () => {
    statusBar.statusBarContainer.isDisplayed().then((result: boolean) => {
      expect(result).toBeTruthy();
    });
    statusBar.statusBarContainerLeft.isDisplayed().then((result: boolean) => {
      expect(result).toBeTruthy();
    });
    statusBar.statusBarContainerCenter.isDisplayed().then((result: boolean) => {
      expect(result).toBeTruthy();
    });
    statusBar.statusBarContainerRight.isDisplayed().then((result: boolean) => {
      expect(result).toBeTruthy();
    });
  });

  it('should contain settings button', () => {
    statusBar.statusBarSettingsButton.isDisplayed().then((result: boolean) => {
      expect(result).toBeTruthy();
    });
  });

  it('should be possible to click settings button and get redirected', () => {
    statusBar.statusBarSettingsButton.click();
    browser.getCurrentUrl().then((url: string) => {
      expect(url).toMatch(statusBar.statusBarSettingsLink);
    });
  });
});
