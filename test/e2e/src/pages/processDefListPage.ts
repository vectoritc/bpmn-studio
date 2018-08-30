import {by, element, ElementArrayFinder, ElementFinder} from 'protractor';

export class ProcessDefListPage {

  // Define Elements
  public processDefinitionListItems: ElementArrayFinder = element.all(by.className('process-definition-list-item'));
  public processDefinitionListItem: ElementFinder = this.processDefinitionListItems.first();

  // Define Functions
  public processDefinitionListItemIds(processModelId: string): ElementArrayFinder {
    return this.processDefinitionListItems.all(by.id('processDef-' + processModelId));
  }
  public processModellDiagram(processModelId: string): ElementFinder {
    return element(by.id('processDef-' + processModelId));
  }

}
