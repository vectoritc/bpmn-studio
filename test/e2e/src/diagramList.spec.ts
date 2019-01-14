import {
  browser,
  ElementArrayFinder,
  ElementFinder,
  protractor,
  ProtractorExpectedConditions,
} from 'protractor';

import {DiagramListPage} from './pages/diagramListPage';
import {General} from './pages/general';
import {ProcessModel} from './pages/processModel';

describe('Diagram list', () => {

  let general: General;
  let diagramListPage: DiagramListPage;
  let processModel: ProcessModel;

  let diagramId: string;

  const aureliaUrl: string = browser.params.aureliaUrl;
  const defaultTimeoutMS: number = browser.params.defaultTimeoutMS;

  const expectedConditions: ProtractorExpectedConditions = protractor.ExpectedConditions;

  beforeAll(() => {

    general = new General();
    diagramListPage = new DiagramListPage();
    processModel = new ProcessModel();

    // Get processModelId
    diagramId = processModel.getProcessModelId();

    // Create a new process definition by POST REST call
    processModel.postProcessModel(diagramId);
  });

  afterAll(async() => {

    await processModel.deleteProcessModel();
  });

  beforeEach(async() => {
    const routerViewContainer: ElementFinder = general.getRouterViewContainer;
    const visibilityOfRouterViewContainer: Function = expectedConditions.visibilityOf(routerViewContainer);

    await browser.get(aureliaUrl);
    await browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfRouterViewContainer, defaultTimeoutMS);

        return routerViewContainer;
     });

    const processModelLink: string = ProcessModel.getProcessModelLink();
    const destination: string = aureliaUrl + processModelLink;

    await browser.get(destination);
    await browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfRouterViewContainer, defaultTimeoutMS);

        return routerViewContainer;
     });

    const diagramListItem: ElementFinder = diagramListPage.diagramListItem;
    const visibilityOfdiagramListItem: Function = expectedConditions.visibilityOf(diagramListItem);

    await browser.driver
      .wait(() => {
        browser
          .wait(visibilityOfdiagramListItem, defaultTimeoutMS);

        return diagramListItem;
      });
  });

  it('should contain at least process definitions.', async() => {
    const diagramListItems: ElementArrayFinder = diagramListPage.diagramListItems;
    const numberOfDiagrams: number = await diagramListItems.count();

    expect(numberOfDiagrams).toBeGreaterThan(0);
  });

  it('should contain just created process definition.', async() => {
    const diagramListItemIds: ElementArrayFinder = diagramListPage.diagramListItemIds(diagramId);
    const numberOfDiagramsById: number = await diagramListItemIds.count();

    expect(numberOfDiagramsById).toBe(1);
  });

  it('should be possible to open a process diagram.', async() => {
    const diagram: ElementFinder = DiagramListPage.diagram(diagramId);

    await diagram.click();

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
