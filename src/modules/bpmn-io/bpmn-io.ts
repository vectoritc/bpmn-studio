import * as bundle from '@process-engine/bpmn-js-custom-bundle';

import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, inject, observable} from 'aurelia-framework';
import * as $ from 'jquery';
import 'spectrum-colorpicker/spectrum';

import {ElementDistributeOptions,
        IBpmnFunction,
        IBpmnModeler,
        IDefinition,
        IModdleElement,
        IModeling,
        IProcessDefEntity,
        IShape,
        NotificationType,
      } from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from './../notification/notification.service';

const sideBarRightSize: number = 35;

@inject('NotificationService', EventAggregator)
export class BpmnIo {
  private _fillColor: string;
  private _borderColor: string;

  private _toggled: boolean = false;
  private _toggleButtonPropertyPanel: HTMLButtonElement;
  private _resizeButton: HTMLButtonElement;
  private _canvasModel: HTMLDivElement;
  private _showXMLView: boolean = false;

  private _resizeButtonRight: number = 285;
  private _canvasRight: number = 350;
  private _minWidth: number = environment.propertyPanel.minWidth;
  private _maxWidth: number = document.body.clientWidth - environment.propertyPanel.maxWidth;
  private _ppWidth: number = 250;
  private _ppDisplay: string = 'inline';
  private _lastCanvasRight: number = 350;
  private _lastPpWidth: number = this._ppWidth;
  private _propertyPanelHiddenForSpaceReasons: boolean = false;
  private _propertyPanelHasNoSpace: boolean = false;
  private _processSolutionExplorerWidth: number = 0;
  private _currentWidth: number = 250;

  private _toggleMinimap: boolean = false;
  private _minimapToggle: any;
  private _expandIcon: HTMLElement;
  private _hideMinimap: HTMLElement;
  private _notificationService: NotificationService;
  private _eventAggregator: EventAggregator;
  private _subscriptions: Array<Subscription>;

  @bindable({changeHandler: 'xmlChanged'}) public xml: string;

  public initialLoadingFinished: boolean;
  public modeler: IBpmnModeler;

  /**
   * We are using the direct reference of a container element to place the tools of bpmn-js
   * in the left sidebar (bpmn-io-layout__tools-left).
   *
   * This needs to be refactored.
   * To get more control over certain elements in the palette it would be nice to have
   * an aurelia-component for handling the logic behind it.
   *
   * TODO: https://github.com/process-engine/bpmn-studio/issues/455
   */
  public paletteContainer: HTMLDivElement;

  constructor(notificationService: NotificationService, eventAggregator: EventAggregator) {
    this._notificationService = notificationService;
    this._eventAggregator = eventAggregator;
  }

  public created(): void {
    this.modeler = new bundle.modeler({
      additionalModules: bundle.additionalModules,
      moddleExtensions: {
        camunda: bundle.camundaModdleDescriptor,
      },
      keyboard: { bindTo: document },
    });

    if (this.xml !== undefined && this.xml !== null) {
      this.modeler.importXML(this.xml, (err: Error) => {
        return 0;
      });
    }
  }

  public attached(): void {
    this.modeler.attachTo(this._canvasModel);
    const minimapViewport: any = this._canvasModel.getElementsByClassName('djs-minimap-viewport')[0];
    const minimapArea: any = this._canvasModel.getElementsByClassName('djs-minimap-map')[0];
    this._minimapToggle = this._canvasModel.getElementsByClassName('djs-minimap-toggle')[0];

    // TODO: Refactor to CSS classes; Ref: https://github.com/process-engine/bpmn-studio/issues/462
    //  Styling for Minimap {{{ //
    minimapArea.style.width = '350px';
    minimapArea.style.height = '200px';
    minimapViewport.style.fill = 'rgba(0, 208, 255, 0.13)';

    this._expandIcon = document.createElement('i');
    this._expandIcon.className = 'glyphicon glyphicon-resize-full expandIcon';
    this._minimapToggle.appendChild(this._expandIcon);

    this._hideMinimap = document.createElement('p');
    this._hideMinimap.className = 'hideMinimap';
    this._hideMinimap.textContent = 'Hide Minimap';
    this._minimapToggle.appendChild(this._hideMinimap);
    this._minimapToggle.addEventListener('click', this.toggleMinimapFunction);
    //  }}} Styling for Minimap //

    window.addEventListener('resize', this.resizeEventHandler);

    this.initialLoadingFinished = true;

    this._resizeButton.addEventListener('mousedown', (e: Event) => {
      const windowEvent: Event = e || window.event;
      windowEvent.cancelBubble = true;

      const mousemoveFunction: EventListenerOrEventListenerObject =  (event: Event): void => {
        this.resize(event);
        document.getSelection().empty();
      };

      const mouseUpFunction: EventListenerOrEventListenerObject =  (event: Event): void => {
        document.removeEventListener('mousemove', mousemoveFunction);
        document.removeEventListener('mouseup', mouseUpFunction);
      };

      document.addEventListener('mousemove', mousemoveFunction);
      document.addEventListener('mouseup', mouseUpFunction);
    });

    const bpmnIoPaletteContainer: Element = document.getElementsByClassName('djs-palette')[0];

    bpmnIoPaletteContainer.className += ' djs-palette-override';

    this.paletteContainer.appendChild(bpmnIoPaletteContainer);

    document.addEventListener('keydown', this._saveHotkeyEventHandler);

    this._eventAggregator.subscribe(environment.events.bpmnIo.showProcessSolutionExplorer, (processSolutionExplorerWidth: number) => {
      this._processSolutionExplorerWidth = processSolutionExplorerWidth;

      this._recalculatePropertyPanelWidth();
    });

    this._eventAggregator.subscribe(environment.events.bpmnIo.hideProcessSolutionExplorer, () => {
      this._processSolutionExplorerWidth = 0;

      this._recalculatePropertyPanelWidth();
    });
  }

  public detached(): void {
    this.modeler.detach();
    this.modeler.destroy();
    window.removeEventListener('resize', this.resizeEventHandler);
    document.removeEventListener('keydown', this._saveHotkeyEventHandler);
  }

  public xmlChanged(newValue: string, oldValue: string): void {
    if (this.modeler !== undefined && this.modeler !== null) {
      this.modeler.importXML(newValue, (err: Error) => {
        return 0;
      });
      this.xml = newValue;
    }
  }

  public getXML(): Promise<string> {
    return new Promise((resolve: Function, reject: Function): void => {
      this.modeler.saveXML({}, (err: Error, result: string) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  public getSVG(): Promise<string> {
    return new Promise((resolve: Function, reject: Function): void => {
      this.modeler.saveSVG({}, (err: Error, result: string) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  private getSelectedElements(): Array<IShape> {
    return this.modeler.get('selection')._selectedElements;
  }

  public togglePanel(): void {
    if (this._toggled === true) {
      if (this._propertyPanelHasNoSpace) {
        this._notificationService.showNotification(NotificationType.ERROR, 'There is not enough space for the property panel!');
        return;
      }

      this._toggleButtonPropertyPanel.classList.add('tool--active');
      this._ppDisplay = 'inline';
      this._canvasRight = this._lastCanvasRight;
      this._toggled = false;
    } else {
      this._lastCanvasRight = this._canvasRight;

      this._toggleButtonPropertyPanel.classList.remove('tool--active');
      this._ppDisplay = 'none';
      this._canvasRight = 1;
      this._toggled = true;
    }
  }

  private _recalculatePropertyPanelWidth(): void {
    this._maxWidth = document.body.clientWidth - environment.propertyPanel.maxWidth - this._processSolutionExplorerWidth;

    this._currentWidth = Math.max(this._currentWidth, this._minWidth);
    this._currentWidth = Math.min(this._currentWidth, this._maxWidth);

    const propertyPanelHasEnoughSpace: boolean = this._hasPropertyPanelEnoughSpace();
    if (propertyPanelHasEnoughSpace) {
      this._hidePropertyPanelForSpaceReasons();
    } else if (this._propertyPanelHiddenForSpaceReasons) {
      this._showPropertyPanelForSpaceReasons();
    }

    this._resizeButtonRight = this._currentWidth + sideBarRightSize;
    this._canvasRight = this._currentWidth;
    this._ppWidth = this._currentWidth;
    this._lastPpWidth = this._currentWidth;
  }

  private _hidePropertyPanelForSpaceReasons(): void {
    this._propertyPanelHasNoSpace = true;

    if (this._toggled === false) {
      this._propertyPanelHiddenForSpaceReasons = true;
      this.togglePanel();
    }
  }

  private _hasPropertyPanelEnoughSpace(): boolean {
    const notEnoughSpaceForPropertyPanel: boolean = this._maxWidth < this._minWidth;

    return notEnoughSpaceForPropertyPanel;
  }

  private _showPropertyPanelForSpaceReasons(): void {
    this._propertyPanelHasNoSpace = false;
    this._propertyPanelHiddenForSpaceReasons = false;

    this._toggled = true;
    this.togglePanel();
  }

  public resize(event: any): void {
    this._currentWidth = document.body.clientWidth - event.clientX;
    this._currentWidth = this._currentWidth - sideBarRightSize;

    this._recalculatePropertyPanelWidth();
  }

  public async toggleXMLView(): Promise<void> {
    if (!this._showXMLView) {
      this.xml = await this.getXML();
      this._showXMLView = true;
    } else {
      this._showXMLView = false;
    }
  }

  private resizeEventHandler = (event: any): void => {
    this._maxWidth = document.body.clientWidth - environment.propertyPanel.maxWidth - this._processSolutionExplorerWidth;

    const propertyPanelHasEnoughSpace: boolean = this._hasPropertyPanelEnoughSpace();
    if (propertyPanelHasEnoughSpace) {
      this._hidePropertyPanelForSpaceReasons();
      return;
    } else if (this._propertyPanelHiddenForSpaceReasons) {
      this._showPropertyPanelForSpaceReasons();
    }

    this._ppWidth = this._lastPpWidth + this._processSolutionExplorerWidth;
    if (this._ppWidth > this._maxWidth) {
      const currentWidth: number = this._maxWidth;

      this._resizeButtonRight = currentWidth + sideBarRightSize;
      this._canvasRight = currentWidth;
      this._ppWidth = currentWidth;
    } else {
      this._resizeButtonRight = this._lastPpWidth + sideBarRightSize;
      this._canvasRight = this._lastPpWidth;
    }
  }

  private toggleMinimapFunction = (): void => {
    if (this._toggleMinimap === false) {
      this._expandIcon.style.display = 'none';
      this._hideMinimap.style.display = 'inline';
      this._minimapToggle.style.height = '20px';
      this._toggleMinimap = true;
    } else {
      this._expandIcon.style.display = 'inline-block';
      this._hideMinimap.style.display = 'none';
      this._toggleMinimap = false;
    }
  }

  /**
   * Handles a key down event and saves the diagram, if the user presses a CRTL + s key combination.
   *
   * If using macOS, this combination will be CMD + s.
   *
   * Saving is triggered by emitting @see environment.events.processDefDetail.saveDiagram
   *
   * @param event Passed key event.
   * @return void
   */
  private _saveHotkeyEventHandler = (event: KeyboardEvent): void  => {

    // On macOS the 'common control key' is the meta instead of the control key. So we need to find
    // out if on a mac, the meta key instead of the control key is pressed.
    const macRegex: RegExp = /.*mac*./i;
    const currentPlattform: string = navigator.platform;
    const currentPlattformIsMac: boolean = macRegex.test(currentPlattform);
    const metaKeyIsPressed: boolean = currentPlattformIsMac ? event.metaKey : event.ctrlKey;

    /*
     * If both keys (meta and s) are pressed, save the diagram.
     * A diagram is saved, by throwing a saveDiagram event.
     *
     * @see environment.events.processDefDetail.saveDiagram
     */
    const sKeyIsPressed: boolean = event.key === 's';
    const userWantsToSave: boolean = metaKeyIsPressed && sKeyIsPressed;

    if (userWantsToSave) {
      // Prevent the browser from handling the default action for CTRL + s.
      event.preventDefault();
      this._eventAggregator.publish(environment.events.processDefDetail.saveDiagram);
    }
  }
}
