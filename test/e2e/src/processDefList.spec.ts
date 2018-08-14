import * as path from 'path';
import {browser} from 'protractor';
import {ProcessDefListPage} from './pages/processdef-list-page';

describe('processDefList', () => {

  const defaultTimeoutMS: number = 2000;
  const aureliaUrl: string = 'http://127.0.0.1:9000';

  browser.driver.manage().deleteAllCookies();
  browser.get(aureliaUrl);

  it('should display process definitions', () => {
    const processDefListPage: ProcessDefListPage = new ProcessDefListPage();
    browser.get(aureliaUrl);
    browser.sleep(defaultTimeout);
    expect(processDefListPage.processDefs.count()).toBeGreaterThan(0);
  });

  it('should navigate to details-view', () => {
    const processDefListPage: ProcessDefListPage = new ProcessDefListPage();
    processDefListPage.detailsButtons.first().click();
    browser.sleep(defaultTimeoutMS);
    expect(browser.getCurrentUrl()).toContain('detail');
  });

});
