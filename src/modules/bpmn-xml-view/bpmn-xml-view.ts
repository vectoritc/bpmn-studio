// import 'ace-builds';
import {bindable} from 'aurelia-framework';
import {DOM} from 'aurelia-pal';
import * as hljs from 'highlight.js';
import 'highlightjs-line-numbers.js';
// import {Prism} from 'prismjs';
import 'prismjs';
// import * as lineNumbers from 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import * as beautify from 'xml-beautifier';

export class BpmnXmlView {

  @bindable() public xml: string;

  @bindable public test: HTMLElement;
  public code: HTMLElement;

  public attached(): void {
    this.xml = beautify(this.xml);
    hljs.initHighlighting();
    hljs.initHighlighting.called = false; // tslint:disable-line
    hljs.initLineNumbersOnLoad(); // tslint:disable-line
    // const editor: any = ace.edit('editor');
    // editor.setTheme('ace/theme/twilight');
    // editor.session.setMode('ace/mode/javascript');
  }

}
