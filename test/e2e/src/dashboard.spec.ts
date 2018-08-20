import {Dashboard} from './pages/dashboard';

import {browser, protractor, ProtractorExpectedConditions} from 'protractor';

describe('Dashboard view', () => {

  const dashboard: Dashboard = new Dashboard();

  const aureliaUrl: string = browser.params.aureliaUrl;
  const defaultTimeoutMS: number = browser.params.defaultTimeoutMS;

  const expectedConditions: ProtractorExpectedConditions = protractor.ExpectedConditions;

  beforeEach(() => {
    browser.get(aureliaUrl + dashboard.dashboardLink);
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(dashboard.routerViewContainer), defaultTimeoutMS);
      return dashboard.routerViewContainer;
    });
  });

  beforeAll(() => {

    // Create a new process definition by POST REST call
    expect(dashboard.postProcessModelWithMessageIntermediateThrowEvent).not.toBeDefined();
    expect(dashboard.startProcess).not.toBeDefined();
  });

  it('should contain at least process definitions.', () => {
      // @TODO EOB work continues here
  });

});
