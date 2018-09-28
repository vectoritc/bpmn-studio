import {
  browser,
  ElementFinder,
  protractor,
  ProtractorExpectedConditions,
} from 'protractor';

import {BpmnIo} from './pages/bpmn-io';
import {ExportDiagram} from './pages/exportDiagram';
import {General} from './pages/general';
import {NavBar} from './pages/navBar';
import {ProcessModel} from './pages/processModel';
import {SolutionExplorer} from './pages/solutionExplorer';

import * as fs from 'fs';

describe('Export BPMN diagram', () => {
  let exportDiagram: ExportDiagram;
  let bpmnIo: BpmnIo;
  let general: General;
  let navBar: NavBar;
  let processModel: ProcessModel;
  let solutionExplorer: SolutionExplorer;

  let processModelId: string;

  const aureliaUrl: string = browser.params.aureliaUrl;
  const defaultTimeoutMS: number = browser.params.defaultTimeoutMS;

  const expectedConditions: ProtractorExpectedConditions = protractor.ExpectedConditions;

  beforeAll(() => {

    bpmnIo = new BpmnIo();
    exportDiagram = new ExportDiagram();
    general = new General();
    navBar = new NavBar();
    processModel = new ProcessModel();
    solutionExplorer = new SolutionExplorer();

    processModelId = processModel.getProcessModelId();

    // Create a new process definition by POST REST call
    processModel.postProcessModelWithUserTask(processModelId);
  });

  beforeEach(async() => {
    const getRouterViewContainer: ElementFinder = general.getRouterViewContainer;
    const visibilityOfRouterViewContainer: Function = expectedConditions.visibilityOf(getRouterViewContainer);

    await browser.get(aureliaUrl);
    await browser.driver
      .wait(() => {
        browser.wait(visibilityOfRouterViewContainer, defaultTimeoutMS);

        return getRouterViewContainer;
      });

    // You have to open solution explorer before click on link
    await navBar.openSolutionExplorerByButtonClick();
    await solutionExplorer.openProcessModelByClick(processModelId);

    const bpmnIoTag: ElementFinder = bpmnIo.bpmnIoTag;
    const visibilityOfBpmnIoTag: Function = expectedConditions.visibilityOf(bpmnIoTag);

    // Wait until diagram is loaded
    await browser.driver
      .wait(() => {
        browser.wait(visibilityOfBpmnIoTag, defaultTimeoutMS);

        return bpmnIo.bpmnIoTag;
      });
  });

  it('should contain export button in navbar.', async() => {
    const navbarExportButton: ElementFinder = navBar.navbarExportButton;
    const navbarExportButtonIsDisplayed: boolean = await navbarExportButton.isDisplayed();

    expect(navbarExportButtonIsDisplayed).toBeTruthy();
  });

  it('should contain `Export as BPMN` button in navbar.', async() => {
    // Show export menu
    await navBar.clickAtNavbarExportButton();

    const navbarExportAsBPMNButton: ElementFinder = navBar.navbarExportAsBPMNButton;
    const navbarExportAsBPMNButtonIsDisplayed: boolean = await navbarExportAsBPMNButton.isDisplayed();

    expect(navbarExportAsBPMNButtonIsDisplayed).toBeTruthy();
  });

  it('should contain `Export as JPEG` button in navbar.', async() => {
    // Show export menu
    await navBar.clickAtNavbarExportButton();

    const navbarExportAsJPEGButton: ElementFinder = navBar.navbarExportAsJPEGButton;
    const navbarExportAsJPEGButtonIsDisplayed: boolean = await navbarExportAsJPEGButton.isDisplayed();

    expect(navbarExportAsJPEGButtonIsDisplayed).toBeTruthy();
  });

  it('should contain `Export as PNG` button in navbar.', async() => {
    // Show export menu
    await navBar.clickAtNavbarExportButton();

    const navbarExportAsPNGButton: ElementFinder = navBar.navbarExportAsPNGButton;
    const navbarExportAsPNGButtonIsDisplayed: boolean = await navbarExportAsPNGButton.isDisplayed();

    expect(navbarExportAsPNGButtonIsDisplayed).toBeTruthy();
  });

  it('should contain `Export as SVG` button in navbar.', async() => {
    // Show export menu
    await navBar.clickAtNavbarExportButton();

    const navbarExportAsSVGButton: ElementFinder = navBar.navbarExportAsSVGButton;
    const navbarExportAsSVGButtonIsDisplayed: boolean = await navbarExportAsSVGButton.isDisplayed();

    expect(navbarExportAsSVGButtonIsDisplayed).toBeTruthy();
  });

  it('should be possible to export diagram as SVG.', async() => {
    const sleepTime: number = 5000;
    // Show export menu
    await navBar.clickAtNavbarExportButton();

    await navBar.clickAtNavbarExportAsSVGButton();

    await browser.sleep(sleepTime);

    const fileExists: boolean = fs.existsSync(`downloads/${processModelId}.svg`);
    expect(fileExists).toBeTruthy();
  });

});
