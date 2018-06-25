import {bindable} from 'aurelia-framework';
import { IBpmnModeler } from '../../contracts';

import * as bundle from '@process-engine/bpmn-js-custom-bundle';

import {IModeling,
  IShape,
  NotificationType} from '../../contracts/index';

export class BpmnDiffView {
  private _leftViewer: IBpmnModeler;
  private _rightViewer: IBpmnModeler;

  @bindable() public xml: string;
  @bindable() public savedxml: string;
  @bindable() public changes: any;
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
    const addedElements: any = this.changes._added;
    const deletedElements: any = this.changes._removed;
    const changedElements: any = this.changes._changed;
    const layoutChangedElements: any = this.changes._layoutChanged;

    this._markDeletedElements(deletedElements);
    this._markChangedElements(changedElements);
    this._markLayoutChangedElements(layoutChangedElements);
    this._markAddedElements(addedElements);
  }

  private _markAddedElements(addedElements: any): void {
    for (const elementId in addedElements) {
      this._addColorMarker(elementId, this._rightViewer, 'added');
    }
  }

  private _markDeletedElements(deletedElemnts: any): void {
    for (const elementId in deletedElemnts) {
      this._addColorMarker(elementId, this._leftViewer, 'deleted');
    }
  }

  private _markLayoutChangedElements(layoutChangedElements: any): void {
    for (const elementId in layoutChangedElements) {
      this._addColorMarker(elementId, this._leftViewer, 'layout-changed');
      this._addColorMarker(elementId, this._rightViewer, 'layout-changed');
    }
  }

  private _markChangedElements(changedElements: any): void {
    for (const elementId in changedElements) {
      if (changedElements[elementId].$type === undefined) {
        continue;
      }

      this._addColorMarker(elementId, this._leftViewer, 'changed');
      this._addColorMarker(elementId, this._rightViewer, 'changed');
    }
  }

  private _addColorMarker(elementId: string, viewer: IBpmnModeler, markerType: string): void {
    const canvas: any = viewer.get('canvas');

    canvas.addMarker(elementId, markerType);
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
