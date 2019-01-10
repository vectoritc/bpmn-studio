import {
  by,
  element,
  ElementArrayFinder,
  ElementFinder,
} from 'protractor';

import {By} from 'selenium-webdriver';

export class ProcessDefListPage {

  // Define Elements
  private _byProcessDefinitionListItem: By = by.className('process-definition-list-item');

  public processDefinitionListItems: ElementArrayFinder = element.all(this._byProcessDefinitionListItem);
  public processDefinitionListItem: ElementFinder = this.processDefinitionListItems.first();

  // Define Functions
  public static processModelDiagram(processModelId: string): ElementFinder {
    const id: string = `diagram-${processModelId}`;
    const byId: By = by.id(id);

    return element(byId);
  }

  public processDefinitionListItemIds(processModelId: string): ElementArrayFinder {
    const id: string = `diagram-${processModelId}`;
    const byId: By = by.id(id);

    return this.processDefinitionListItems.all(byId);
  }
}
