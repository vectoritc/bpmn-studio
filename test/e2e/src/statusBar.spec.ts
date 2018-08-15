import {browser, by, element, ElementFinder, protractor, ProtractorExpectedConditions} from 'protractor';

describe('status-bar', () => {
  const aureliaUrl: string = browser.params.aureliaUrl;
  const defaultTimeoutMS: number = browser.params.defaultTimeoutMS;

  const expectedConditions: ProtractorExpectedConditions = protractor.ExpectedConditions;
  const statusBar: ElementFinder = element(by.tagName('status-bar'));

  browser.driver.manage().deleteAllCookies();

  beforeEach(() => {
    browser.get(aureliaUrl);
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(statusBar), defaultTimeoutMS);
      return statusBar;
    });
  });

  it('should display', () => {
    statusBar.isDisplayed().then((result: boolean) => {
      expect(result).toBeTruthy();
    });
  });

  it('should contain root and 3 elements (left-bar, center-bar, right bar)', () => {
    expect(statusBar.element(by.className('status-bar')).element.length).toBe(1);
    expect(statusBar.element(by.className('status-bar__left-bar')).element.length).toBe(1);
    expect(statusBar.element(by.className('status-bar__center-bar')).element.length).toBe(1);
    expect(statusBar.element(by.className('status-bar__right-bar')).element.length).toBe(1);
  });

  it('should contain settings button', () => {
    const statusBarSettingsButton: ElementFinder = statusBar.element(by.id('statusBarSettingsButton'));

    statusBarSettingsButton.isDisplayed().then((result: boolean) => {
      expect(result).toBeTruthy();
    });
  });

  it('should be possible to click settings button and get redirected', () => {
    const statusBarSettingsButton: ElementFinder = statusBar.element(by.id('statusBarSettingsButton'));

    statusBarSettingsButton.click();
    browser.getCurrentUrl().then((url: string) => {
      expect(url).toMatch('configuration');
    });
  });

  afterEach(() => {
    browser.executeScript('window.localStorage.clear();');
    browser.executeScript('window.sessionStorage.clear();');
    browser.driver.manage().deleteAllCookies();
  });
});
