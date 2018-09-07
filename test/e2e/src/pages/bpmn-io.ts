import {
  by,
  element,
  ElementFinder,
} from 'protractor';

import {By} from 'selenium-webdriver';

export class BpmnIo {

  // Define Elements
  private _byTagName: By = by.tagName('bpmn-io');

  public bpmnIoTag: ElementFinder = element(this._byTagName);
}
