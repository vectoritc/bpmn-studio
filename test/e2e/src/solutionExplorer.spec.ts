import {SolutionExplorer} from './pages/solutionExplorer';

import {browser, protractor, ProtractorExpectedConditions} from 'protractor';

describe('Solution Explorer', () => {

  const solutionExplorer: SolutionExplorer = new SolutionExplorer();

  const aureliaUrl: string = browser.params.aureliaUrl;
  const defaultTimeoutMS: number = browser.params.defaultTimeoutMS;

  const expectedConditions: ProtractorExpectedConditions = protractor.ExpectedConditions;

  beforeEach(() => {
    browser.get(aureliaUrl);
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(solutionExplorer.solutionExplorerTag), defaultTimeoutMS);
      return solutionExplorer.solutionExplorerTag;
    });
  });

  beforeAll(() => {

    // Create a new process definition by POST REST call
    expect(solutionExplorer.postProcessModel).not.toBeDefined();
  });

  it('should display process definitions.', () => {

    // Count items and expect at least one
    solutionExplorer.solutionExplorerListItems.count().then((numberOfProcessDefinitions: number) => {
      expect(numberOfProcessDefinitions).toBeGreaterThan(0);
    });

    // Search for the process diagram created in this test
    solutionExplorer.solutionExplorerListItemsId.count().then((numberOfProcessDefinitionsById: number) => {
      expect(numberOfProcessDefinitionsById).toBe(1);
    });
  });

  it('should be possible to open a process diagram.', () => {

    // Click on a process definition
    solutionExplorer.processModellDiagram.click().then(() => {
      browser.getCurrentUrl().then((currentBrowserUrl: string) => {

        // Check if diagram showed up
        expect(currentBrowserUrl).toContain(solutionExplorer.processModelUrl);
      });
    });
  });

});
