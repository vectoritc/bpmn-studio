import {inject} from 'aurelia-dependency-injection';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable} from 'aurelia-framework';

import * as bundle from '@process-engine/bpmn-js-custom-bundle';

import {defaultBpmnColors,
  DiffMode,
  IBpmnModeler,
  ICanvas,
  IColorPickerColor,
  IDiffChanges,
  IElementRegistry,
  IEventBus,
  IEventFunction,
  IModeling,
  IShape} from '../../contracts/index';
import environment from '../../environment';

@inject(EventAggregator)
export class BpmnDiffView {
  private _eventAggregator: EventAggregator;

  private _leftViewer: IBpmnModeler;
  private _rightViewer: IBpmnModeler;
  private _lowerViewer: IBpmnModeler;
  private _diffModeler: IBpmnModeler;
  private _modeling: IModeling;
  private _elementRegistry: IElementRegistry;
  private _subscriptions: Array<Subscription>;

  private _currentDiffMode: DiffMode;

  @bindable() public xml: string;
  @bindable() public savedxml: string;
  @bindable() public changes: IDiffChanges;
  public leftCanvasModel: HTMLElement;
  public rightCanvasModel: HTMLElement;
  public lowerCanvasModel: HTMLElement;
  public diffModeTitle: string = 'Bitte einen Diff Modus auswählen.';

  constructor(eventAggregator: EventAggregator) {
    this._eventAggregator  = eventAggregator;
  }

  public attached(): void {
    this._leftViewer.attachTo(this.leftCanvasModel);
    this._rightViewer.attachTo(this.rightCanvasModel);
    this._lowerViewer.attachTo(this.lowerCanvasModel);

    this._subscriptions = [
      this._eventAggregator.subscribe(environment.events.diffView.changeDiffMode, (diffMode: DiffMode) => {
        this._currentDiffMode = diffMode;
        this._updateDiffView();
      }),
      this._eventAggregator.subscribe(environment.events.diffView.toggleChangeList, () => {
        // tslint:disable-next-line
        console.log(this.changes);
      }),
    ];
  }

  public created(): void {
    this._leftViewer = this._createNewViewer();
    this._rightViewer = this._createNewViewer();
    this._lowerViewer = this._createNewViewer();

    this._diffModeler = new bundle.modeler();

    this._modeling = this._diffModeler.get('modeling');
    this._elementRegistry = this._diffModeler.get('elementRegistry');

    this._startSynchronizingViewers();
  }

  public detached(): void {
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
  }

  public xmlChanged(): void {
    this._importXml(this.xml, this._rightViewer);
  }

  public savedxmlChanged(): void {
    this._importXml(this.savedxml, this._leftViewer);
  }

  public changesChanged(): void {
    this._updateDiffView();
  }

  private _markAddedElements(addedElements: object): void {
    const elementsToColor: Array<IShape> = this._getElementsToColor(addedElements);

    this._colorElements(elementsToColor, defaultBpmnColors.green);
  }

  private _markRemovedElements(deletedElements: object): void {
    const elementsToColor: Array<IShape> = this._getElementsToColor(deletedElements);

    this._colorElements(elementsToColor, defaultBpmnColors.red);
  }

  private _startSynchronizingViewers(): void {
    const lowerCanvas: ICanvas = this._lowerViewer.get('canvas');
    const leftCanvas: any = this._leftViewer.get('canvas');
    const rightCanvas: any = this._rightViewer.get('canvas');

    this.setEventFunctions(lowerCanvas, leftCanvas, rightCanvas);
    this.setEventFunctions(leftCanvas, rightCanvas, lowerCanvas);
    this.setEventFunctions(rightCanvas, lowerCanvas, leftCanvas);
  }

  private setEventFunctions(changingCanvas: ICanvas, firstCanvas: ICanvas, secondCanvas: ICanvas): void {
    const changingCanvasContainer: HTMLElement = changingCanvas._container;

    const adjustViewboxes: IEventFunction = (): void => {
      const changedViewbox: string = changingCanvas.viewbox();
      firstCanvas.viewbox(changedViewbox);
      secondCanvas.viewbox(changedViewbox);
    };

    const checkForMousemovement: IEventFunction = (): void => {
      window.onmousemove = adjustViewboxes;
    };
    const stopCheckingForMousemovement: IEventFunction = (): void => {
      window.onmousemove = null;
    };

    changingCanvasContainer.onwheel = adjustViewboxes;
    changingCanvasContainer.onmousedown = checkForMousemovement;
    changingCanvasContainer.onmouseup = stopCheckingForMousemovement;
  }

  private _markLayoutChangedElements(layoutChangedElements: object): void {
    const elementsToColor: Array<IShape> = this._getElementsToColor(layoutChangedElements);

    this._colorElements(elementsToColor, defaultBpmnColors.purple);
  }

  private _markChangedElements(changedElements: object): void {
    const changedElementsWithChanges: object = this._removeElementsWithoutChanges(changedElements);

    const elementsToColor: Array<IShape> = this._getElementsToColor(changedElementsWithChanges);

    this._colorElements(elementsToColor, defaultBpmnColors.orange);
  }

  /*
  * This function removes all elements without any changes from the changedElement object
  * and returns an object without these elements.
  *
  *  This is needed because the diff function always adds the start event
  *  to the changed Elements even though it has no changes.
  */
  private _removeElementsWithoutChanges(changedElements: object): object {
    for (const elementId in changedElements) {
      const currentElementHasNoChanges: boolean = Object.keys(changedElements[elementId].attrs).length === 0;

      if (currentElementHasNoChanges) {
        delete changedElements[elementId];
      }
    }

    return changedElements;
  }

  private _updateDiffView(): void {
    if (this._currentDiffMode === DiffMode.PreviousToCurrent) {
      this._updateLowerDiff(this.xml);
      this.diffModeTitle = 'Vorher vs. Nachher';
    } else if (this._currentDiffMode === DiffMode.CurrentToPrevious) {
      this._updateLowerDiff(this.savedxml);
      this.diffModeTitle = 'Nachher vs. Vorher';
    } else {
      this.diffModeTitle = 'Bitte einen Diff Modus auswählen.';
    }
  }

  private async _updateLowerDiff(xml: string): Promise<void> {
    const xmlIsNotLoaded: boolean = xml === undefined || xml === null;

    if (xmlIsNotLoaded) {
      return;
    }

    const addedElements: object = this.changes._added;
    const removedElements: object = this.changes._removed;
    const changedElements: object = this.changes._changed;
    const layoutChangedElements: object = this.changes._layoutChanged;

    const diffModeIsPreviousToCurrent: boolean = this._currentDiffMode === DiffMode.PreviousToCurrent;

    await this._importXml(xml, this._diffModeler);
    this._markChangedElements(changedElements);
    this._markLayoutChangedElements(layoutChangedElements);

    diffModeIsPreviousToCurrent ?
      this._markAddedElements(addedElements) :
      this._markRemovedElements(removedElements);

    const coloredXml: string = await this._getXmlFromModdeler();
    await this._importXml(coloredXml, this._lowerViewer);
  }

  private _importXml(xml: string, viewer: IBpmnModeler): Promise <void> {
    const xmlIsNotLoaded: boolean = xml === undefined || xml === null;

    if (xmlIsNotLoaded) {
      return;
    }

    return new Promise((resolve: Function, reject: Function): void => {
      viewer.importXML(xml, (importXmlError: Error) => {
        if (importXmlError) {
          reject(importXmlError);
          return;
        }

        resolve();
      });
    });
  }

  private _getXmlFromModdeler(): Promise<string> {
    return new Promise((resolve: Function, reject: Function): void =>  {
      this._diffModeler.saveXML({}, async(saveXmlError: Error, xml: string) => {
        if (saveXmlError) {
          reject(saveXmlError);
          return;
        }

        resolve(xml);
      });
    });
  }

  private _createNewViewer(): IBpmnModeler {
    return new bundle.viewer({
      additionalModules:
      [
        bundle.ZoomScrollModule,
        bundle.MoveCanvasModule,
      ],
    });
  }

  private _getElementsToColor(elements: object): Array<IShape> {
    const elementsToColor: Array<IShape> = [];

    for (const elementId in elements) {
      const currentElement: IShape = this._elementRegistry.get(elementId);

      elementsToColor.push(currentElement);
    }

    return elementsToColor;
  }

  private _colorElements(elementsToColor: Array<IShape>, color: IColorPickerColor): void {
    const noElementsToColorize: boolean = elementsToColor.length === 0;

    if (noElementsToColorize) {
      return;
    }

    this._modeling.setColor(elementsToColor, {
      stroke: color.border,
      fill: color.fill,
    });
  }
}
