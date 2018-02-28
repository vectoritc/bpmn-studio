import {bindable} from 'aurelia-framework';
import * as hljs from 'highlight.js';
import 'highlightjs-line-numbers.js';
import * as beautify from 'xml-beautifier';

const highlightEngine: {
  // tslint:disable-next-line:prefer-method-signature
  highlightBlock: (element: HTMLElement) => void;
  // tslint:disable-next-line:prefer-method-signature
  lineNumbersBlock: (element: HTMLElement) => void;
} = hljs as any;

export class BpmnXmlView {

  private codeElement: HTMLElement;
  @bindable() public xml: string;

  public attached(): void {
    this.xml = beautify(this.xml);
    highlightEngine.highlightBlock(this.codeElement);
    highlightEngine.lineNumbersBlock(this.codeElement);
  }

}
