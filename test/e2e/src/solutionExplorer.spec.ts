import {browser, ElementArrayFinder, ElementFinder, protractor, ProtractorExpectedConditions} from 'protractor';
import {promise} from 'selenium-webdriver';

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

    processModelId = processModel.getProcessModelId();

    // Create a new process definition by POST REST call
    processModel.postProcessModel(processModelId);
  });

  beforeEach(() => {
    const navBarTag: ElementFinder = navBar.navBarTag;
    const visibilityOfNavBarTag: Function = expectedConditions.visibilityOf(navBarTag);

    browser.get(aureliaUrl);
    browser.driver
      .wait(() => {
        browser.wait(visibilityOfNavBarTag, defaultTimeoutMS);
        return navBarTag;
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
    const solutionExplorerListItems: ElementArrayFinder = solutionExplorer.solutionExplorerListItems;

    solutionExplorerListItems
      .count()
      .then((numberOfProcessDefinitions: number) => {
        expect(numberOfProcessDefinitions).toBeGreaterThan(0);
     });
  });

  it('should display created solution.', () => {
    const solutionExplorerListItemsIds: ElementArrayFinder = solutionExplorer.solutionExplorerListItemsIds(processModelId);

    solutionExplorerListItemsIds
      .count()
      .then((numberOfProcessDefinitionsById: number) => {
        expect(numberOfProcessDefinitionsById).toBe(1);
      });
  });

  it('should be possible to open a process diagram.', () => {
    const openProcessModelByClick: promise.Promise<void> = solutionExplorer.openProcessModelByClick(processModelId);
    const getProcessModelLink: string = processModel.getProcessModelLink();

    openProcessModelByClick
      .then(() => {
        browser
          .getCurrentUrl()
          .then((currentBrowserUrl: string) => {
            expect(currentBrowserUrl).toContain(getProcessModelLink);
          });
      });
  });

});
