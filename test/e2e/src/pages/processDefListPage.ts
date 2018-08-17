import {General} from './general';
import {ProcessModel} from './processModel';

import {by, element, ElementArrayFinder, ElementFinder} from 'protractor';

export class ProcessDefListPage {

  // Define Instances
  private _general: General = new General();
  private _process: ProcessModel = new ProcessModel();

  // Define Links, Urls, Classes

  // Define Class method call forwarding
  public routerViewContainer: ElementFinder = this._general.routerViewContainer;
  public processModelID: string = this._process.processModelID;
  public processModelUrl: string = this._process.processModelUrl(this.processModelID);
  public processModelLink: string = this._process.processModelLink;
  public postProcessModel: void = this._process.postProcessModel();

  // Define Elements
  public processDefinitionListItems: ElementArrayFinder = element.all(by.className('process-definition-list-item'));
  public processDefinitionListItemIDs: ElementArrayFinder = this.processDefinitionListItems.all(by.id('processDef-' + this.processModelID));
  public processModellDiagram: ElementFinder = element(by.id('processDef-' + this.processModelID));

  // Define Functions
}
