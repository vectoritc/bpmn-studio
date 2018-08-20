import {by, element, ElementArrayFinder, ElementFinder} from 'protractor';

export class ProcessDefListPage {

  // Define Elements
  public processDefinitionListItems: ElementArrayFinder = element.all(by.className('process-definition-list-item'));
  public processDefinitionListItem: ElementFinder = this.processDefinitionListItems.first();

  // Define Functions
  public processDefinitionListItemIDs(processModelID: string): ElementArrayFinder {
    return this.processDefinitionListItems.all(by.id('processDef-' + processModelID));
  }
  public processModellDiagram(processModelID: string): ElementFinder {
    return element(by.id('processDef-' + processModelID));
  }

}
