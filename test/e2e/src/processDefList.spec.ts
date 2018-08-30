import {browser, protractor, ProtractorExpectedConditions} from 'protractor';

import {General} from './pages/general';
import {ProcessDefListPage} from './pages/processDefListPage';
import {ProcessModel} from './pages/processModel';

describe('Process definition list', () => {

  let general: General;
  let processDefListPage: ProcessDefListPage;
  let processModel: ProcessModel;

  let processModelId: string;

  const aureliaUrl: string = browser.params.aureliaUrl;
  const defaultTimeoutMS: number = browser.params.defaultTimeoutMS;

  const expectedConditions: ProtractorExpectedConditions = protractor.ExpectedConditions;

  beforeAll(() => {

    general = new General();
    processDefListPage = new ProcessDefListPage();
    processModel = new ProcessModel();

    // Get processModelId
    processModelId = processModel.getProcessModelId();

    // Create a new process definition by POST REST call
    processModel.postProcessModel(processModelId);
  });

  beforeEach(() => {
    browser.get(aureliaUrl + processModel.getProcessModelLink());
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(general.getRouterViewContainer), defaultTimeoutMS);
      return general.getRouterViewContainer;
    });
    browser.driver.wait(() => {
      browser.wait(expectedConditions.visibilityOf(processDefListPage.processDefinitionListItem), defaultTimeoutMS);
      return processDefListPage.processDefinitionListItem;
    });
  });

  it('should contain at least process definitions.', () => {
    processDefListPage.processDefinitionListItems.count().then((numberOfProcessDefinitions: number) => {
      expect(numberOfProcessDefinitions).toBeGreaterThan(0);
    });
  });

  it('should contain just created process definition.', () => {
    processDefListPage.processDefinitionListItemIds(processModelId).count().then((numberOfProcessDefinitionsById: number) => {
      expect(numberOfProcessDefinitionsById).toBe(1);
    });
  });

  it('should be possible to open a process diagram.', () => {
    processDefListPage.processModellDiagram(processModelId).click().then(() => {
      browser.getCurrentUrl().then((currentBrowserUrl: string) => {
        expect(currentBrowserUrl).toContain(processModel.getProcessModelLink());
      });
    });
  });

});
