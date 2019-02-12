import {browser, by, element, ElementFinder, ExpectedConditions} from 'protractor';

import {By} from 'selenium-webdriver';

export class SolutionExplorer {

  private _diagramIdIdentifier: string = 'diagramList-';
  private _solutionExplorerPanelTag: string = 'solution-explorer-panel';

  public async init(): Promise<void> {
    browser.wait(ExpectedConditions.visibilityOf(this._solutionExplorerPanelContainer), browser.params.defaultTimeoutMS);
  }

  public async getVisbilityOfSolutionExplorer(): Promise<boolean> {

    return this._solutionExplorerPanelContainer.isDisplayed();
  }

  public async getVisibilityOfDiagramEntry(diagramName: string): Promise<boolean> {
    const diagramEntry: ElementFinder = this._getDiagramEntry(diagramName);

    return diagramEntry.isDisplayed();
  }

  public async openDiagramByClick(diagramName: string): Promise<void> {
    const diagramIdentifier: ElementFinder = this._getDiagramEntry(diagramName);

    return diagramIdentifier.click();
  }

  private get _solutionExplorerPanelContainer(): ElementFinder {
    const panelContainerByTag: By = by.tagName(this._solutionExplorerPanelTag);

    return element(panelContainerByTag);
  }

  private _getDiagramEntry(diagramName: string): ElementFinder {
    const diagramEntryById: string = this._diagramIdIdentifier + diagramName;
    const byId: By = by.id(diagramEntryById);

    return element(byId);
  }

}
