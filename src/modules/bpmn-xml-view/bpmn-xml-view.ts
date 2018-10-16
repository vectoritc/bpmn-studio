import {bindingMode} from 'aurelia-binding';
import {bindable} from 'aurelia-framework';
import * as hljs from 'highlight.js';
import 'highlightjs-line-numbers.js';

const highlightEngine: hljs = hljs as hljs;

export class BpmnXmlView {

  public codeElement: HTMLElement;
  @bindable() public xml: string;
  @bindable({ defaultBindingMode: bindingMode.oneWay }) public newXML: string;

  public attached(): void {
    highlightEngine.configure({
      languages: ['xml'],
    });

    if (this.codeElement) {
      this.highlight();
    }
  }

  public xmlChanged(): void {
    if (this.codeElement) {
      this.highlight();
    }
  }

  public highlight(): void {
    this.newXML = this.xml;
    highlightEngine.lineNumbersBlock(this.codeElement);
    highlightEngine.highlightBlock(this.codeElement);
  }

}
