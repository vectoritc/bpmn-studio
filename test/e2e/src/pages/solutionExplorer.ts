import {by, element, ElementArrayFinder, ElementFinder} from 'protractor';

export class SolutionExplorer {

  // Define Links, Urls, Classes

  // Define Elements
  public solutionExplorerTag: ElementFinder = element(by.tagName('process-solution-panel'));
  public solutionExplorerListItems: ElementArrayFinder = this.solutionExplorerTag.all(by.className('process-explorer__structure-item'));

  // Define Functions
  public solutionExplorerListItemsId(processModelID: string): ElementFinder {
    return this.solutionExplorerTag.element(by.id('processSolutionPanel-' + processModelID));
  }
  public solutionExplorerListItemsIds(processModelID: string): ElementArrayFinder {
    return this.solutionExplorerListItems.all(by.id('processSolutionPanel-' + processModelID));
  }
  public processModellDiagram(processModelID: string): ElementFinder {
    return element(by.id('processSolutionPanel-' + processModelID));
  }
}
