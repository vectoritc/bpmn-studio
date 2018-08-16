import {by, element, ElementArrayFinder, ElementFinder} from 'protractor';

export class ProcessDefListPage {
  // tslint:disable-next-line:no-magic-numbers
  public processModel: string = 'TA_' + Math.floor(Math.random() * 1000000);

  public processDefinitionListItems: ElementArrayFinder = element.all(by.className('process-definition-list-item'));
  public processModellDiagram: ElementFinder = element(by.id('processDef-' + this.processModel));
  public processDefinitionListItemIDs: ElementArrayFinder = this.processDefinitionListItems.all(by.id('processDef-' + this.processModel));
}
