import {ProcessDefListPage} from './pages/processDefListPage';

import {browser, protractor, ProtractorExpectedConditions} from 'protractor';

describe('processDefList', () => {

  const processDefListPage: ProcessDefListPage = new ProcessDefListPage();

  const aureliaUrl: string = browser.params.aureliaUrl;
  const defaultTimeoutMS: number = browser.params.defaultTimeoutMS;

  const expectedConditions: ProtractorExpectedConditions = protractor.ExpectedConditions;

  beforeEach(() => {
    browser.get(aureliaUrl + processDefListPage.processModelLink);
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(processDefListPage.routerViewContainer), defaultTimeoutMS);
      return processDefListPage.routerViewContainer;
    });
  });

  beforeAll(() => {

    // Create a new process definition
    expect(processDefListPage.postProcessModel).not.toBeDefined();
  });

  it('should display process definitions', () => {

    // Count items and expect at least one
    processDefListPage.processDefinitionListItems.count().then((count: number) => {
      expect(count).toBeGreaterThan(0);
    });

    // Search for the process diagram created in this test
    processDefListPage.processDefinitionListItemIDs.count().then((result: number) => {
      expect(result).toBe(1);
    });
  });

  it('should be possible to open a process diagram', () => {

    // Click on a process definition
    processDefListPage.processModellDiagram.click().then(() => {
      browser.getCurrentUrl().then((url: string) => {

        // Check if diagram showed up
        expect(url).toContain(processDefListPage.processModelUrl);
      });
    });
  });
});
