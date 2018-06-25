import {bindable} from 'aurelia-framework';
import { IBpmnModeler } from '../../contracts';

import * as bundle from '@process-engine/bpmn-js-custom-bundle';

export class BpmnDiffView {
  private _leftViewer: IBpmnModeler;
  private _rightViewer: IBpmnModeler;

  @bindable() public xml: string;
  @bindable() public savedxml: string;
  @bindable() public changes: Object;
  public leftCanvasModel: HTMLElement;
  public rightCanvasModel: HTMLElement;

  public attached(): void {
    this._leftViewer.attachTo(this.leftCanvasModel);
    this._rightViewer.attachTo(this.rightCanvasModel);
  }

  public created(): void {
    this._leftViewer = new bundle.viewer({
      additionalModules:
      [
        bundle.ZoomScrollModule,
        bundle.MoveCanvasModule,
      ],
    });

    this._rightViewer = new bundle.viewer({
      additionalModules:
      [
        bundle.ZoomScrollModule,
        bundle.MoveCanvasModule,
      ],
    });
  }

  public changesChanged(): void {
  }

  public xmlChanged(): void {
    if (this.xml !== undefined && this.xml !== null) {
      this._rightViewer.importXML(this.xml, (err: Error) => {
        return 0;
      });
    }
  }

  public savedxmlChanged(): void {
    if (this.savedxml !== undefined && this.savedxml !== null) {
      this._leftViewer.importXML(this.savedxml, (err: Error) => {
        return 0;
      });
    }
  }
}
