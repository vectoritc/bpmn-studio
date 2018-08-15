import {browser, by, element, ElementFinder, protractor, ProtractorExpectedConditions} from 'protractor';
import {ProcessDefListPage} from './pages/processdef-list-page';

describe('processDefList', () => {

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

  it('should display process definitions', () => {
    const processDefListPage: ProcessDefListPage = new ProcessDefListPage();
    expect(processDefListPage.processDefs.count()).toBeGreaterThanOrEqual(0);
  });
  
  afterEach(() => {
    browser.executeScript('window.localStorage.clear();');
    browser.executeScript('window.sessionStorage.clear();');
    browser.driver.manage().deleteAllCookies();
  });
});
