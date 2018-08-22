import {by, element, ElementFinder} from 'protractor';

export class BpmnIo {

  // Define Elements
  public bpmnIoTag: ElementFinder = element(by.tagName('bpmn-io'));
}
