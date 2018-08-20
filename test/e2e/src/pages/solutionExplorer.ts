import {by, element, ElementArrayFinder, ElementFinder} from 'protractor';

export class SolutionExplorer {

  // Define Elements
  public solutionExplorerTag: ElementFinder = element(by.tagName('process-solution-panel'));
  public solutionExplorerListItems: ElementArrayFinder = this.solutionExplorerTag.all(by.className('process-explorer__structure-item'));

  // Define Functions
  public solutionExplorerListItemsId(processModelId: string): ElementFinder {
    return this.solutionExplorerTag.element(by.id('processSolutionPanel-' + processModelId));
  }
  public solutionExplorerListItemsIds(processModelId: string): ElementArrayFinder {
    return this.solutionExplorerListItems.all(by.id('processSolutionPanel-' + processModelId));
  }
  public processModellDiagram(processModelId: string): ElementFinder {
    return element(by.id('processSolutionPanel-' + processModelId));
  }

}
