import {
  by,
  element,
  ElementArrayFinder,
  ElementFinder,
} from 'protractor';

import {By} from 'selenium-webdriver';

export class DiagramListPage {

  // Define Elements
  private _byDiagramListItem: By = by.className('diagram-list-item');

  public diagramListItems: ElementArrayFinder = element.all(this._byDiagramListItem);
  public diagramListItem: ElementFinder = this.diagramListItems.first();

  // Define Functions
  public static diagram(diagramId: string): ElementFinder {
    const id: string = `diagram-${diagramId}`;
    const byId: By = by.id(id);

    return element(byId);
  }

  public diagramListItemIds(diagramId: string): ElementArrayFinder {
    const id: string = `diagram-${diagramId}`;
    const byId: By = by.id(id);

    return this.diagramListItems.all(byId);
  }
}
