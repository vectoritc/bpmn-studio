import {bindable} from 'aurelia-framework';
import * as hljs from 'highlight.js';
import 'highlightjs-line-numbers.js';
import * as beautify from 'xml-beautifier';

interface InitHighlighting {
  (): void;
  called: boolean;
}

const highlightEngine: {
  initHighlighting: InitHighlighting;
  // tslint:disable-next-line:prefer-method-signature
  initLineNumbersOnLoad: () => void;
} = hljs as any;

export class BpmnXmlView {

  @bindable() public xml: string;

  public attached(): void {
    this.xml = beautify(this.xml);
    highlightEngine.initHighlighting();
    highlightEngine.initHighlighting.called = false;
    highlightEngine.initLineNumbersOnLoad();
  }

}
