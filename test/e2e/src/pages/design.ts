import {
  by,
  element,
  ElementFinder,
} from 'protractor';

import {By} from 'selenium-webdriver';

export class Design {

  // Define Elements
  private _byClassName: By = by.className('design');

  public designTag: ElementFinder = element(this._byClassName);
}
