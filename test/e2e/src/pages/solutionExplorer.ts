import {NavBar} from './navBar';
import {ProcessModel} from './processModel';

import {by, element, ElementArrayFinder, ElementFinder} from 'protractor';

export class SolutionExplorer {

  // Define Instances
  private process: ProcessModel = new ProcessModel();
  private navBar: NavBar = new NavBar();

  // Define Links, Urls, Classes

  // Define Class method call forwarding
  public processModelID: string = this.process.processModelID;
  public processModelUrl: string = this.process.processModelUrl(this.processModelID);
  public postProcessModel: void = this.process.postProcessModel();
  public navBarTag: ElementFinder = this.navBar.navBarTag;
  public navBarSolutionExplorerButton: ElementFinder = this.navBar.navBarSolutionExplorerButton;

  // Define Elements
  public solutionExplorerTag: ElementFinder = element(by.tagName('process-solution-panel'));
  public solutionExplorerListItems: ElementArrayFinder = this.solutionExplorerTag.all(by.className('process-explorer__structure-item'));
  public solutionExplorerListItemsId: ElementFinder = this.solutionExplorerTag.element(by.id('processSolutionPanel-' + this.processModelID));
  public solutionExplorerListItemsIds: ElementArrayFinder = this.solutionExplorerListItems.all(by.id('processSolutionPanel-' + this.processModelID));
  public processModellDiagram: ElementFinder = element(by.id('processSolutionPanel-' + this.processModelID));

  // Define Functions
}
