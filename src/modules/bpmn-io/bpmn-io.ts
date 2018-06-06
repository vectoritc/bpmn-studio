import * as bundle from '@process-engine/bpmn-js-custom-bundle';

import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, inject, observable} from 'aurelia-framework';
import * as $ from 'jquery';

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
  public modeler: IBpmnModeler;

  public toggleButtonPropertyPanel: HTMLButtonElement;
  public resizeButton: HTMLButtonElement;
  public canvasModel: HTMLDivElement;
  public propertyPanel: HTMLElement;

  @bindable({changeHandler: 'xmlChanged'}) public xml: string;
  public propertyPanelDisplay: string = 'inline';
  public initialLoadingFinished: boolean = false;
  public showXMLView: boolean = false;
  public colorPickerLoaded: boolean = false;
  public propertyPanelWidth: number = 250;
  public minCanvasWidth: number = 100;
  public minPropertyPanelWidth: number = 200;

  private _toggled: boolean = false;
  private _propertyPanelHiddenForSpaceReasons: boolean = false;
  private _propertyPanelHasNoSpace: boolean = false;

  private _toggleMinimap: boolean = false;
  private _minimapToggle: any;
  private _expandIcon: HTMLElement;
  private _hideMinimap: HTMLElement;
  private _notificationService: NotificationService;
  private _eventAggregator: EventAggregator;
  private _subscriptions: Array<Subscription>;

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
      keyboard: {
        bindTo: document,
      },
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
    this._minimapToggle = this.canvasModel.getElementsByClassName('djs-minimap-toggle')[0];

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

    this._subscriptions = [
      this._eventAggregator.subscribe(environment.events.bpmnIo.toggleProcessSolutionExplorer, () => {
        this._hideOrShowPpForSpaceReasons();
      }),
      this._eventAggregator.subscribe(environment.events.processDefDetail.toggleXMLView, () => {
        setTimeout(() => {
          this._hideOrShowPpForSpaceReasons();
        }, 0);
      }),
    ];
  }

  public detached(): void {
    this.modeler.detach();
    this.modeler.destroy();
    window.removeEventListener('resize', this.resizeEventHandler);
    document.removeEventListener('keydown', this._saveHotkeyEventHandler);

    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
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

  public togglePanel(): void {
    if (this._toggled === true) {
      if (this._propertyPanelHasNoSpace) {
        this._notificationService.showNotification(NotificationType.ERROR, 'There is not enough space for the property panel!');
        return;
      }

      this.toggleButtonPropertyPanel.classList.add('tool--active');
      this.propertyPanelDisplay = 'inline';
      this._toggled = false;
    } else {

      this.toggleButtonPropertyPanel.classList.remove('tool--active');
      this.propertyPanelDisplay = 'none';
      this._toggled = true;
    }
  }

  public resize(event: any): void {
    const mousePosition: number = event.clientX;

    this._setNewPropertyPanelWidthFromMousePosition(mousePosition);
  }

  public async toggleXMLView(): Promise<void> {
    if (!this.showXMLView) {
      this.xml = await this.getXML();
      this.showXMLView = true;
    } else {
      this.showXMLView = false;
    }
  }

  private getSelectedElements(): Array<IShape> {
    return this.modeler.get('selection')._selectedElements;
  }

  private _setNewPropertyPanelWidthFromMousePosition(mousePosition: number): void {
    const propertyPanelMaxWidth: number = this.propertyPanel.parentElement.offsetWidth - this.minCanvasWidth;
    const mousePositionFromRight: number = document.body.clientWidth - mousePosition;
    const resizedWidth: number = mousePositionFromRight - sideBarRightSize;

    /*
     * This is needed to stop the width from increasing too far
     * The property panel would not be displayed with that width,
     * but when increasing the browser width, the property panel then may also increase
    */
    const newPropertyPanelWidth: number = Math.min(resizedWidth, propertyPanelMaxWidth);

    this.propertyPanelWidth = newPropertyPanelWidth;
  }

  private _hidePropertyPanelForSpaceReasons(): void {
    this._propertyPanelHasNoSpace = true;

    if (this._toggled === false) {
      this._propertyPanelHiddenForSpaceReasons = true;
      this.togglePanel();
    }
  }

  private _showPropertyPanelForSpaceReasons(): void {
    this._propertyPanelHasNoSpace = false;
    this._propertyPanelHiddenForSpaceReasons = false;

    this._toggled = true;
    this.togglePanel();
  }

  private resizeEventHandler = (event: any): void => {
    this._hideOrShowPpForSpaceReasons();

    const mousePosition: number = event.clientX;

    this._setNewPropertyPanelWidthFromMousePosition(mousePosition);
  }

  private _hideOrShowPpForSpaceReasons(): void {
    const minModelerWidthForPropertyPanel: number = this.minCanvasWidth + this.minPropertyPanelWidth;
    const modelerWidth: number = this.propertyPanel.parentElement.offsetWidth;

    if (modelerWidth === 0) {
      return;
    }

    this._propertyPanelHasNoSpace = modelerWidth < minModelerWidthForPropertyPanel;
    if (this._propertyPanelHasNoSpace) {
      this._hidePropertyPanelForSpaceReasons();
    } else if (this._propertyPanelHiddenForSpaceReasons) {
      this._showPropertyPanelForSpaceReasons();
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
