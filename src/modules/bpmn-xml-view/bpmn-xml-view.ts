// import 'ace-builds';
import {bindable} from 'aurelia-framework';
import {DOM} from 'aurelia-pal';
import * as hljs from 'highlight.js';
import 'highlightjs-line-numbers.js';
// import {Prism} from 'prismjs';
import 'prismjs';
// import * as lineNumbers from 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import * as beautify from 'xml-beautifier';
// tslint:disable:no-namespace
// tslint:disable:no-internal-module
// declare module hljs {
//   // tslint:disable-next-line:class-name
//   export interface initHighlighting {
//     called: boolean;
//   }
// }
// tslint:disable-next-line:class-name
interface initHighlighting {
  (): void;
  called: boolean;
}

const myhljs: {
  initHighlighting: initHighlighting;
  // tslint:disable-next-line:prefer-method-signature
  initLineNumbersOnLoad: () => void;
} = hljs as any;

export class BpmnXmlView {

  @bindable() public xml: string;

  @bindable public test: HTMLElement;
  public code: HTMLElement;

  public attached(): void {
    this.xml = beautify(this.xml);
    myhljs.initHighlighting();
    myhljs.initHighlighting.called = false;
    myhljs.initLineNumbersOnLoad();
    // const editor: any = ace.edit('editor');
    // editor.setTheme('ace/theme/twilight');
    // editor.session.setMode('ace/mode/javascript');
  }

}
