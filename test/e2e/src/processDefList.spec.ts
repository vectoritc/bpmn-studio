import {
  browser,
  ElementArrayFinder,
  ElementFinder,
  protractor,
  ProtractorExpectedConditions,
} from 'protractor';

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

  afterAll(async() => {

    await processModel.deleteProcessModel();
  });

  beforeEach(async() => {
    const processModelLink: string = ProcessModel.getProcessModelLink();
    const destination: string = aureliaUrl + processModelLink;
    const routerViewContainer: ElementFinder = general.getRouterViewContainer;
    const visibilityOfRouterViewContainer: Function = expectedConditions.visibilityOf(routerViewContainer);

    await browser.get(destination);
    await browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfRouterViewContainer, defaultTimeoutMS);

        return routerViewContainer;
     });

    const processDefinitionListItem: ElementFinder = processDefListPage.processDefinitionListItem;
    const visibilityOfProcessDefinitionListItem: Function = expectedConditions.visibilityOf(processDefinitionListItem);

    await browser.driver
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
    const processModelDiagram: ElementFinder = ProcessDefListPage.processModelDiagram(processModelId);

    await processModelDiagram.click();

    const routerViewContainer: ElementFinder = general.getRouterViewContainer;
    const visibilityOfRouterViewContainer: Function = expectedConditions.visibilityOf(routerViewContainer);

    browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfRouterViewContainer, defaultTimeoutMS);

        return routerViewContainer;
     });

    const currentBrowserUrl: string = await browser.getCurrentUrl();
    const processModelLink: string = ProcessModel.getProcessModelUrl();

    expect(currentBrowserUrl).toContain(processModelLink);
  });
});
