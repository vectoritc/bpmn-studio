import {inject} from 'aurelia-dependency-injection';
import {EventAggregator} from 'aurelia-event-aggregator';
import {bindable} from 'aurelia-framework';

import * as bundle from '@process-engine/bpmn-js-custom-bundle';

import {defaultBpmnColors,
  DiffMode,
  IBpmnModeler,
  IColorPickerColor,
  IDiffChanges,
  IElementRegistry,
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

    this._eventAggregator.subscribe(environment.events.diffView.changeDiffMode, (diffMode: DiffMode) => {
      this._currentDiffMode = diffMode;
      this._updateDiffView();
    });
  }

  public created(): void {
    this._leftViewer = this._createNewViewer();
    this._rightViewer = this._createNewViewer();
    this._lowerViewer = this._createNewViewer();

    this._diffModeler = new bundle.modeler();

    this._modeling = this._diffModeler.get('modeling');
    this._elementRegistry = this._diffModeler.get('elementRegistry');
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

  private _markDeletedElements(deletedElements: object): void {
    const elementsToColor: Array<IShape> = this._getElementsToColor(deletedElements);

    this._colorElements(elementsToColor, defaultBpmnColors.red);
  }

  private _markLayoutChangedElements(layoutChangedElements: object): void {
    const elementsToColor: Array<IShape> = this._getElementsToColor(layoutChangedElements);

    this._colorElements(elementsToColor, defaultBpmnColors.purple);
  }

  private _markChangedElements(changedElements: object): void {
    const elementsToColor: Array<IShape> = this._getElementsToColor(changedElements);

    this._colorElements(elementsToColor, defaultBpmnColors.orange);
  }

  private async _updateDiffView(): Promise<void> {
    const addedElements: object = this.changes._added;
    const deletedElements: object = this.changes._removed;
    const changedElements: object = this.changes._changed;
    const layoutChangedElements: object = this.changes._layoutChanged;

    if (this._currentDiffMode === DiffMode.PreviousToCurrent) {
      if (this.xml === undefined || this.xml === null) {
        return;
      }

      await this._importXml(this.xml, this._diffModeler);
      this._markAddedElements(addedElements);
      this._markChangedElements(changedElements);
      this._markLayoutChangedElements(layoutChangedElements);

      const coloredXml: string = await this._getXmlFromModdeler();
      await this._importXml(coloredXml, this._lowerViewer);

      this.diffModeTitle = 'Vorher -> Nachher';

    } else if (this._currentDiffMode === DiffMode.CurrentToPrevious) {
      if (this.savedxml === undefined || this.savedxml === null) {
        return;
      }

      await this._importXml(this.savedxml, this._diffModeler);
      this._markDeletedElements(deletedElements);
      this._markChangedElements(changedElements);
      this._markLayoutChangedElements(layoutChangedElements);

      const coloredXml: string = await this._getXmlFromModdeler();
      await this._importXml(coloredXml, this._lowerViewer);

      this.diffModeTitle = 'Nachher -> Vorher';
    } else {
      this.diffModeTitle = 'Bitte einen Diff Modus auswählen.';
    }
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

  private _getElementsToColor(elements: object): Array <IShape> {
    const elementsToColor: Array<IShape> = [];

    for (const elementId in elements) {
      const currentElement: IShape = this._elementRegistry.get(elementId);

      elementsToColor.push(currentElement);
    }

    return elementsToColor;
  }

  private _colorElements(elementsToColor: Array <IShape > , color: IColorPickerColor): void {
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
