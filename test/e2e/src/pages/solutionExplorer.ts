import {browser, by, element, ElementFinder, ExpectedConditions} from 'protractor';

import {By} from 'selenium-webdriver';

export class SolutionExplorer {

  // Define Elements
  private identifier: string = 'diagramList-';
  public solutionExplorerTag: ElementFinder = element(by.tagName('solution-explorer-list'));
  public solutionExplorerListItems: ElementArrayFinder = this.solutionExplorerTag.all(by.className('diagram-entry'));

  // Define Functions
  public solutionExplorerListItemsId(processModelId: string): ElementFinder {
    const id: string = this.identifier + processModelId;
    const byId: By = by.id(id);

    return this.solutionExplorerTag.element(byId);
  }
  public solutionExplorerListItemsIds(processModelId: string): ElementArrayFinder {
    const id: string = this.identifier + processModelId;
    const byId: By = by.id(id);

    return element.all(byId);
  }

  public async openProcessModelByClick(processModelId: string): promise.Promise<void> {
    const retryCount: number = 3;
    const hibernatingSeconds: number = 1000;
    const solutionExplorerListItemsId: ElementFinder = this.solutionExplorerListItemsId(processModelId);

    for (let currentTry: number = 1; currentTry <= retryCount; currentTry++) {
      const itemIsPresent: boolean = await solutionExplorerListItemsId.isPresent();
      if (itemIsPresent) {
        break;
      } else {
        browser.sleep(hibernatingSeconds);
      }
    }

    return solutionExplorerListItemsId.click();
  }
}
