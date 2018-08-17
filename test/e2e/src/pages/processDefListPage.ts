import {ProcessModel} from './processModel';

import {by, element, ElementArrayFinder, ElementFinder} from 'protractor';

export class ProcessDefListPage {

  // Define Instances
  private process: ProcessModel = new ProcessModel();

  // Define Links, Urls, Classes

  // Define Class method call forwarding
  public processModelID: string = this.process.processModelID;
  public processModelUrl: string = this.process.processModelUrl(this.processModelID);
  public processModelLink: string = this.process.processModelLink;
  public postProcessModel: void = this.process.postProcessModel();

  // Define Elements
  public routerViewContainer: ElementFinder = element(by.tagName('router-view'));
  public processDefinitionListItems: ElementArrayFinder = element.all(by.className('process-definition-list-item'));
  public processDefinitionListItemIDs: ElementArrayFinder = this.processDefinitionListItems.all(by.id('processDef-' + this.processModelID));
  public processModellDiagram: ElementFinder = element(by.id('processDef-' + this.processModelID));

  // Define Functions
}
