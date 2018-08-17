import {ProcessModel} from './processModel';

import {by, element, ElementArrayFinder, ElementFinder} from 'protractor';

export class SolutionExplorer {
  private process: ProcessModel = new ProcessModel();

  public processModelID: string = this.process.processModelID;
  public processModelUrl: string = this.process.processModelUrl(this.processModelID);
  public postProcessModel: void = this.process.postProcessModel();

  public solutionExplorerTag: ElementFinder = element(by.tagName('process-solution-panel'));
  public solutionExplorerListItems: ElementArrayFinder = element.all(by.className('process-explorer__structure-item'));
  public solutionExplorerListItemsId: ElementArrayFinder = this.solutionExplorerListItems.all(by.id('processSolutionPanel-' + this.processModelID));
  public processModellDiagram: ElementFinder = element(by.id('processSolutionPanel-' + this.processModelID));
}
