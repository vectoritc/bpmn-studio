import {ProcessDefListPage} from './pages/processDefListPage';

import {browser, protractor, ProtractorExpectedConditions} from 'protractor';

describe('Process definition list', () => {

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

    // Create a new process definition by POST REST call
    expect(processDefListPage.postProcessModel).not.toBeDefined();
  });

  it('should contain at least process definitions.', () => {
    processDefListPage.processDefinitionListItems.count().then((numberOfProcessDefinitions: number) => {
      expect(numberOfProcessDefinitions).toBeGreaterThan(0);
    });
  });

  it('should contain just created process definition.', () => {
    processDefListPage.processDefinitionListItemIDs.count().then((numberOfProcessDefinitionsById: number) => {
      expect(numberOfProcessDefinitionsById).toBe(1);
    });
  });

  it('should be possible to open a process diagram.', () => {
    processDefListPage.processModellDiagram.click().then(() => {
      browser.getCurrentUrl().then((currentBrowserUrl: string) => {
        expect(currentBrowserUrl).toContain(processDefListPage.processModelUrl);
      });
    });
  });

});
