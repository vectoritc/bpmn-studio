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
  // tslint:disable-next-line:prefer-method-signature
  lineNumbersBlock: (element: any) => void;
  // tslint:disable-next-line:prefer-method-signature
  highlightBlock: (element: any) => void;
} = hljs as any;

export class BpmnXmlView {

  @bindable() public xml: string;

  public attached(): void {
    this.xml = beautify(this.xml);
    highlightEngine.highlightBlock(document.getElementById('test'));
    highlightEngine.configure({
      classPrefix: 'hljs-',
      tabReplace: true,
      useBR: false,
      languages: undefined,
    });
    // highlightEngine.initHighlighting.called = false;
    // highlightEngine.initLineNumbersOnLoad();
    highlightEngine.lineNumbersBlock(document.getElementById('test'));
  }

  public detached(): void {
    console.log('detached called');
    this.xml = null;
  }

}
