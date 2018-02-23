import {bindable} from 'aurelia-framework';
// import {Prism} from 'prismjs';
import 'prismjs';
// import * as lineNumbers from 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import * as beautify from 'xml-beautifier';

export class BpmnXmlView {

  @bindable() public xml: string;

  public attached(): void {
    this.xml = beautify(this.xml);
  }

}
