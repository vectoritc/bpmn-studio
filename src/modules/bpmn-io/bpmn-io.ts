import * as bundle from '@process-engine/bpmn-js-custom-bundle';

import {EventAggregator} from 'aurelia-event-aggregator';
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
  private toggled: boolean = false;
  private toggleButtonPropertyPanel: HTMLButtonElement;
  private resizeButton: HTMLButtonElement;
  private canvasModel: HTMLDivElement;
  private refresh: boolean = true;
  private isResizeClicked: boolean = false;
  private showXMLView: boolean = false;

  private resizeButtonRight: number = 282;
  private canvasRight: number = 350;
  private minWidth: number = environment.propertyPanel.minWidth;
  private maxWidth: number = document.body.clientWidth - environment.propertyPanel.maxWidth;
  private ppWidth: number = 250;
  private ppDisplay: string = 'inline';
  private lastCanvasRight: number = 350;
  private lastPpWidth: number = this.ppWidth;
  private _ppHiddenBecauseLackOfSpace: boolean = false;
  private _propertyPanelHasNoSpace: boolean = false;

  private toggleMinimap: boolean = false;
  private minimapToggle: any;
  private expandIcon: HTMLElement;
  private hideMinimap: HTMLElement;
  private notificationService: NotificationService;

  private _eventAggregator: EventAggregator;

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
   * https://github.com/process-engine/bpmn-studio/issues/455
   */
  public paletteContainer: HTMLDivElement;

  constructor(notificationService: NotificationService, eventAggregator: EventAggregator) {
    this.notificationService = notificationService;
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
    this.modeler.attachTo(this.canvasModel);
    const minimapViewport: any = this.canvasModel.getElementsByClassName('djs-minimap-viewport')[0];
    const minimapArea: any = this.canvasModel.getElementsByClassName('djs-minimap-map')[0];
    this.minimapToggle = this.canvasModel.getElementsByClassName('djs-minimap-toggle')[0];

    minimapArea.style.width = '350px';
    minimapArea.style.height = '200px';
    minimapViewport.style.fill = 'rgba(0, 208, 255, 0.13)';

    this.expandIcon = document.createElement('i');
    this.expandIcon.className = 'glyphicon glyphicon-resize-full expandIcon';
    this.minimapToggle.appendChild(this.expandIcon);

    this.hideMinimap = document.createElement('p');
    this.hideMinimap.className = 'hideMinimap';
    this.hideMinimap.textContent = 'Hide Minimap';
    this.minimapToggle.appendChild(this.hideMinimap);
    this.minimapToggle.addEventListener('click', this.toggleMinimapFunction);

    window.addEventListener('resize', this.resizeEventHandler);

    this.initialLoadingFinished = true;

    this.resizeButton.addEventListener('mousedown', (e: Event) => {
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
    if (this.toggled === true) {
      if (this._propertyPanelHasNoSpace) {
        this.notificationService.showNotification(NotificationType.ERROR, 'There is not enough space for the property panel!');
        return;
      }

      this.toggleButtonPropertyPanel.classList.add('tool--active');
      this.ppDisplay = 'inline';
      this.canvasRight = this.lastCanvasRight;
      this.toggled = false;
    } else {
      this.lastCanvasRight = this.canvasRight;

      this.toggleButtonPropertyPanel.classList.remove('tool--active');
      this.ppDisplay = 'none';
      this.canvasRight = 1;
      this.toggled = true;
    }
  }

  public resize(event: any): void {
    let currentWidth: number = document.body.clientWidth - event.clientX;
    currentWidth = currentWidth - sideBarRightSize;
    currentWidth = Math.max(currentWidth, this.minWidth);
    currentWidth = Math.min(currentWidth, this.maxWidth);

    const resizeDivAdjustmentPixel: number = 3;

    this.resizeButtonRight = currentWidth + sideBarRightSize - resizeDivAdjustmentPixel;
    this.canvasRight = currentWidth;
    this.ppWidth = currentWidth;
    this.lastPpWidth = currentWidth;
  }

  public async toggleXMLView(): Promise<void> {
    if (!this.showXMLView) {
      this.xml = await this.getXML();
      this.showXMLView = true;
    } else {
      this.showXMLView = false;
    }
  }

  private resizeEventHandler = (event: any): void => {
    this.maxWidth = document.body.clientWidth - environment.propertyPanel.maxWidth;

    const notEnoughSpaceForPp: boolean = this.maxWidth < this.minWidth;
    if (notEnoughSpaceForPp) {
      if (this._propertyPanelHasNoSpace) {
        return;
      }

      this._propertyPanelHasNoSpace = true;

      if (this.toggled === false) {
        this._ppHiddenBecauseLackOfSpace = true;
        this.togglePanel();
      }

      return;
    }

    if (this._propertyPanelHasNoSpace) {
      this._propertyPanelHasNoSpace = false;

      if (this._ppHiddenBecauseLackOfSpace) {
        this.toggled = true;
        this._ppHiddenBecauseLackOfSpace = false;
        this.togglePanel();
      }

      return;
    }
    const resizeDivAdjustmentPixel: number = 3;
    this.ppWidth = this.lastPpWidth;
    if (this.ppWidth > this.maxWidth) {
      const currentWidth: number = this.maxWidth;

      this.resizeButtonRight = currentWidth + sideBarRightSize - resizeDivAdjustmentPixel;
      this.canvasRight = currentWidth;
      this.ppWidth = currentWidth;
    } else {
      this.resizeButtonRight = this.lastPpWidth + sideBarRightSize - resizeDivAdjustmentPixel;
      this.canvasRight = this.lastPpWidth;
    }
  }

  private toggleMinimapFunction = (): void => {
    if (this.toggleMinimap === false) {
      this.expandIcon.style.display = 'none';
      this.hideMinimap.style.display = 'inline';
      this.minimapToggle.style.height = '20px';
      this.toggleMinimap = true;
    } else {
      this.expandIcon.style.display = 'inline-block';
      this.hideMinimap.style.display = 'none';
      this.toggleMinimap = false;
    }
  }

  /**
   * Handles a keydown event and saves the diagramm, if the user presses a ctrl + s key combination.
   * If using macos, this combination will be cmd + s.
   *
   * @param event passed key event.
   */
  private _saveHotkeyEventHandler = (event: KeyboardEvent): void  => {

    // On mac os the 'common control key' is the meta instead of the control key. So we need to find
    // out if on a mac, the meta key instead of the control key is pressed.
    const macRegex: RegExp = /.*mac*./i;
    const currentPlattform: string = navigator.platform;
    const currentPlattformIsMac: boolean = macRegex.test(currentPlattform);
    const metaKeyIsPressed: boolean = currentPlattformIsMac ? event.metaKey : event.ctrlKey;

    // If both keys, meta and s, are pressed, save the diagram.
    const sKeyIsPressed: boolean = event.key === 's';
    const userWantsToSave: boolean = metaKeyIsPressed && sKeyIsPressed;

    if (userWantsToSave) {
      // Prevent the browser from handling the default action for ctrl + s.
      event.preventDefault();
      this._eventAggregator.publish(environment.events.processDefDetail.saveDiagram);
    }
  }
}
