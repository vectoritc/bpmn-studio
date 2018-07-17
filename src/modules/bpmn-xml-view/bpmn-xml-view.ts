import {bindingMode} from 'aurelia-binding';
import {bindable} from 'aurelia-framework';
import * as hljs from 'highlight.js';
import 'highlightjs-line-numbers.js';
import * as beautify from 'xml-beautifier';

const highlightEngine: {
  // tslint:disable-next-line:prefer-method-signature
  highlightBlock: (element: HTMLElement) => void;
  // tslint:disable-next-line:prefer-method-signature
  lineNumbersBlock: (element: HTMLElement) => void;
} = hljs as hljs;

export class BpmnXmlView {

  public codeElement: HTMLElement;
  @bindable() public xml: string;
  @bindable({ defaultBindingMode: bindingMode.oneWay }) public newXML: string;

  public attached(): void {
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
    this.newXML = beautify(this.xml);
    highlightEngine.highlightBlock(this.codeElement);
    highlightEngine.lineNumbersBlock(this.codeElement);
  }

}
