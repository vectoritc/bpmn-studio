import {by, element, ElementFinder} from 'protractor';
import {By} from 'selenium-webdriver';

export class General {

  // Define Elements
  private byTagName: By = by.tagName('router-view');

  public getRouterViewContainer: ElementFinder = element(this.byTagName);

}
