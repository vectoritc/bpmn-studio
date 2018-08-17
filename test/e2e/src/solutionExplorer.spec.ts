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
      browser.wait(expectedConditions.visibilityOf(solutionExplorer.navBarTag), defaultTimeoutMS);
      return solutionExplorer.navBarTag;
    });

    // Click on solution explorer icon
    solutionExplorer.navBarSolutionExplorerButton.click();

    // Wait until solutions are loaded
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(solutionExplorer.solutionExplorerListItemsId), defaultTimeoutMS);
      return solutionExplorer.solutionExplorerListItemsId;
    });
  });

  beforeAll(() => {

    // Create a new process definition by POST REST call
    expect(solutionExplorer.postProcessModel).not.toBeDefined();
  });

  it('should display more than one process definitions.', () => {
    solutionExplorer.solutionExplorerListItems.count().then((numberOfProcessDefinitions: number) => {
      expect(numberOfProcessDefinitions).toBeGreaterThan(0);
    });
  });

  it('should display created solution.', () => {
    solutionExplorer.solutionExplorerListItemsIds.count().then((numberOfProcessDefinitionsById: number) => {
      expect(numberOfProcessDefinitionsById).toBe(1);
    });
  });

  it('should be possible to open a process diagram.', () => {
    solutionExplorer.solutionExplorerListItemsId.click().then(() => {
      browser.getCurrentUrl().then((currentBrowserUrl: string) => {
        expect(currentBrowserUrl).toContain(solutionExplorer.processModelUrl);
      });
    });
  });

});
