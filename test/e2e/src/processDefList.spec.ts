import {browser, ElementArrayFinder, ElementFinder, protractor, ProtractorExpectedConditions} from 'protractor';

import {General} from './pages/general';
import {ProcessDefListPage} from './pages/processDefListPage';
import {ProcessModel} from './pages/processModel';

fdescribe('Process definition list', () => {

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
    const processModelLink: string = processModel.getProcessModelLink();
    const destination: string = aureliaUrl + processModelLink;
    const routerViewContainer: ElementFinder = general.getRouterViewContainer;
    const visibilityOfRouterViewContainer: Function = expectedConditions.visibilityOf(routerViewContainer);

    browser.get(destination);
    browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfRouterViewContainer, defaultTimeoutMS);
        return routerViewContainer;
     });

    const processDefinitionListItem: ElementFinder = processDefListPage.processDefinitionListItem;
    const visibilityOfProcessDefinitionListItem: Function = expectedConditions.visibilityOf(processDefinitionListItem);

    browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfProcessDefinitionListItem, defaultTimeoutMS);
        return processDefinitionListItem;
      });
  });

  it('should contain at least process definitions.', async() => {
    const processDefinitionListItems: ElementArrayFinder = processDefListPage.processDefinitionListItems;
    const numberOfProcessDefinitions: number = await processDefinitionListItems.count();

    expect(numberOfProcessDefinitions).toBeGreaterThan(0);
  });

  it('should contain just created process definition.', async() => {
    const processDefinitionListItemIds: ElementArrayFinder = processDefListPage.processDefinitionListItemIds(processModelId);
    const numberOfProcessDefinitionsById: number = await processDefinitionListItemIds.count();

    expect(numberOfProcessDefinitionsById).toBe(1);
  });

  it('should be possible to open a process diagram.', async() => {
    const processModellDiagram: ElementFinder = processDefListPage.processModellDiagram(processModelId);

    await processModellDiagram.click();

    const routerViewContainer: ElementFinder = general.getRouterViewContainer;
    const visibilityOfRouterViewContainer: Function = expectedConditions.visibilityOf(routerViewContainer);

    browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfRouterViewContainer, defaultTimeoutMS);
        return routerViewContainer;
     });

    const currentBrowserUrl: string = await browser.getCurrentUrl();
    const processModelLink: string = processModel.getProcessModelLink();

    expect(currentBrowserUrl).toContain(processModelLink);
  });
});
