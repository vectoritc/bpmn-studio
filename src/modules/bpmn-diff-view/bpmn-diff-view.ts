import {inject} from 'aurelia-dependency-injection';
import {EventAggregator} from 'aurelia-event-aggregator';
import {bindable} from 'aurelia-framework';

import * as bundle from '@process-engine/bpmn-js-custom-bundle';

import {DiffMode, IBpmnModeler} from '../../contracts/index';
import environment from '../../environment';

@inject(EventAggregator)
export class BpmnDiffView {
  private _leftViewer: IBpmnModeler;
  private _rightViewer: IBpmnModeler;
  private _lowerViewer: IBpmnModeler;
  private _eventAggregator: EventAggregator;

  @bindable() public xml: string;
  @bindable() public savedxml: string;
  @bindable() public changes: any;
  public leftCanvasModel: HTMLElement;
  public rightCanvasModel: HTMLElement;
  public lowerCanvasModel: HTMLElement;

  constructor(eventAggregator: EventAggregator) {
    this._eventAggregator  = eventAggregator;
  }

  public attached(): void {
    this._leftViewer.attachTo(this.leftCanvasModel);
    this._rightViewer.attachTo(this.rightCanvasModel);
    this._lowerViewer.attachTo(this.lowerCanvasModel);

    this._eventAggregator.subscribe(environment.events.diffView.changeDiffMode, (mode: DiffMode) => {
      const addedElements: any = this.changes._added;
      const deletedElements: any = this.changes._removed;
      const changedElements: any = this.changes._changed;
      const layoutChangedElements: any = this.changes._layoutChanged;

      if (mode === DiffMode.PreviousToCurrent) {
        if (this.xml === undefined || this.xml === null) {
          return;
        }

        this._lowerViewer.importXML(this.xml, () => {
          this._markAddedElements(addedElements);
          this._markChangedElements(changedElements);
          this._markLayoutChangedElements(layoutChangedElements);
        });

      } else if (mode === DiffMode.CurrentToPrevious) {
        if (this.savedxml === undefined || this.savedxml === null) {
          return;
        }

        this._lowerViewer.importXML(this.savedxml, () => {
          this._markDeletedElements(deletedElements);
          this._markChangedElements(changedElements);
          this._markLayoutChangedElements(layoutChangedElements);
        });
      }
    });
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

    this._lowerViewer = new bundle.viewer({
      additionalModules:
      [
        bundle.ZoomScrollModule,
        bundle.MoveCanvasModule,
      ],
    });
  }

  private _markAddedElements(addedElements: any): void {
    for (const elementId in addedElements) {
      this._addColorMarker(elementId, this._lowerViewer, 'added');
    }
  }

  private _markDeletedElements(deletedElemnts: any): void {
    for (const elementId in deletedElemnts) {
      this._addColorMarker(elementId, this._lowerViewer, 'deleted');
    }
  }

  private _markLayoutChangedElements(layoutChangedElements: any): void {
    for (const elementId in layoutChangedElements) {
      this._addColorMarker(elementId, this._lowerViewer, 'layout-changed');
    }
  }

  private _markChangedElements(changedElements: any): void {
    for (const elementId in changedElements) {
      if (changedElements[elementId].$type === undefined) {
        continue;
      }

      this._addColorMarker(elementId, this._lowerViewer, 'changed');
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
