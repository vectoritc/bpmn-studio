import {browser, by, element} from 'protractor';

describe('isLaunching', () => {

  const defaultTimeoutMS: number = 5000;
  const aureliaUrl: string = browser.params.aureliaUrl + '/processdef';

  browser.driver.manage().deleteAllCookies();
  browser.get(aureliaUrl);

  it('should display the satusbar', () => {
    browser.get(aureliaUrl);
    browser.sleep(defaultTimeoutMS);
    expect(element.all(by.tagName('status-bar')).count()).toBeGreaterThan(0);
  });
});
