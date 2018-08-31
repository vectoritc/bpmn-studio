import {browser, ElementFinder, protractor, ProtractorExpectedConditions} from 'protractor';
import {promise} from 'selenium-webdriver';

import {BpmnIo} from './pages/bpmn-io';
import {BpmnXmlView} from './pages/bpmnXmlView';
import {General} from './pages/general';
import {NavBar} from './pages/navbar';
import {ProcessModel} from './pages/processModel';
import {SolutionExplorer} from './pages/solutionExplorer';
import {StatusBar} from './pages/statusBar';

fdescribe('bpmn-io XML view', () => {

  let bpmnIo: BpmnIo;
  let bpmnXmlView: BpmnXmlView;
  let general: General;
  let navBar: NavBar;
  let processModel: ProcessModel;
  let solutionExplorer: SolutionExplorer;
  let statusBar: StatusBar;

  let processModelId: string;

  const aureliaUrl: string = browser.params.aureliaUrl;
  const defaultTimeoutMS: number = browser.params.defaultTimeoutMS;

  const expectedConditions: ProtractorExpectedConditions = protractor.ExpectedConditions;

  beforeAll(() => {
    bpmnIo = new BpmnIo();
    bpmnXmlView = new BpmnXmlView();
    general = new General();
    navBar = new NavBar();
    processModel = new ProcessModel();
    solutionExplorer = new SolutionExplorer();
    statusBar = new StatusBar();

    processModelId = processModel.getProcessModelId();

    // Create a new process definition by POST REST call
    processModel.postProcessModelWithUserTask(processModelId);
  });

  beforeEach(() => {
    const getRouterViewContainer: ElementFinder = general.getRouterViewContainer;
    const visibilityOfRouterViewContainer: Function = expectedConditions.visibilityOf(getRouterViewContainer);

    browser.get(aureliaUrl);
    browser.driver
      .wait(() => {
        browser.wait(visibilityOfRouterViewContainer, defaultTimeoutMS);
        return getRouterViewContainer;
      });

    // You have to open solution explorer before click on link
    navBar.openSolutionExplorerByButtonClick();
    solutionExplorer.openProcessModelByClick(processModelId);

    const bpmnIoTag: ElementFinder = bpmnIo.bpmnIoTag;
    const visibilityOfBpmnIoTag: Function = expectedConditions.visibilityOf(bpmnIoTag);

    // Wait until diagram is loaded
    browser.driver
      .wait(() => {
        browser.wait(visibilityOfBpmnIoTag, defaultTimeoutMS);
        return bpmnIoTag;
      });
  });

  it('should contain `Show XML` button in status bar.', () => {
    const statusBarXMLViewButton: ElementFinder = statusBar.statusBarXMLViewButton;
    const statusBarXMLViewButtonIsDisplayed: promise.Promise<boolean> = statusBarXMLViewButton.isDisplayed();

    statusBarXMLViewButtonIsDisplayed
      .then((itIsDisplayed: boolean) => {
        expect(itIsDisplayed).toBeTruthy();
      });
  });

  it('should be possbile to open xml view when click on `Show XML` button.', () => {
    const statusBarXMLViewButton: ElementFinder = statusBar.statusBarXMLViewButton;
    const openXMLViewByClickOnButton: promise.Promise<void> = bpmnXmlView.openXMLViewByClickOnButton(statusBarXMLViewButton);
    const bpmnXmlViewTag: ElementFinder = bpmnXmlView.bpmnXmlViewTag;
    const bpmnXmlViewTagIsDisplayed: promise.Promise<boolean> = bpmnXmlViewTag.isDisplayed();

    openXMLViewByClickOnButton
      .then(() => {
        bpmnXmlViewTagIsDisplayed
          .then((xmlViewIsDisplayed: boolean) => {
            expect(xmlViewIsDisplayed).toBeTruthy();
          });
      });
  });
});
