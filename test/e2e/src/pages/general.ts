import {by, element, ElementFinder} from 'protractor';

export class General {

  // Define Elements
  public getRouterViewContainer: ElementFinder = element(by.tagName('router-view'));

}
