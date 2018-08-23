import {browser, protractor, ProtractorExpectedConditions} from 'protractor';

import {NavBar} from './pages/navBar';
import {ProcessModel} from './pages/processModel';
import {SolutionExplorer} from './pages/solutionExplorer';

describe('Solution Explorer', () => {

  let navBar: NavBar;
  let processModel: ProcessModel;
  let solutionExplorer: SolutionExplorer;

  let processModelId: string;

  const aureliaUrl: string = browser.params.aureliaUrl;
  const defaultTimeoutMS: number = browser.params.defaultTimeoutMS;

  const expectedConditions: ProtractorExpectedConditions = protractor.ExpectedConditions;

  beforeAll(() => {

    navBar = new NavBar();
    processModel = new ProcessModel();
    solutionExplorer = new SolutionExplorer();

    processModelId = processModel.getProcessModelID();

    // Create a new process definition by POST REST call
    processModel.postProcessModel(processModelId);
  });

  beforeEach(() => {
    browser.get(aureliaUrl);
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(navBar.navBarTag), defaultTimeoutMS);
      return navBar.navBarTag;
    });

    // Click on solution explorer icon
    navBar.openSolutionExplorerByButtonClick();

    // Wait until solutions are loaded
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(solutionExplorer.solutionExplorerListItemsId(processModelId)), defaultTimeoutMS);
      return solutionExplorer.solutionExplorerListItemsId(processModelId);
    });
  });

  it('should display more than one process definitions.', () => {
    solutionExplorer.solutionExplorerListItems.count().then((numberOfProcessDefinitions: number) => {
      expect(numberOfProcessDefinitions).toBeGreaterThan(0);
    });
  });

  it('should display created solution.', () => {
    solutionExplorer.solutionExplorerListItemsIds(processModelId).count().then((numberOfProcessDefinitionsById: number) => {
      expect(numberOfProcessDefinitionsById).toBe(1);
    });
  });

  it('should be possible to open a process diagram.', () => {
    solutionExplorer.solutionExplorerListItemsId(processModelId).click().then(() => {
      browser.getCurrentUrl().then((currentBrowserUrl: string) => {
        expect(currentBrowserUrl).toContain(processModel.getProcessModelLink());
      });
    });
  });

});
