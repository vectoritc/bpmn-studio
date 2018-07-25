import * as bundle from '@process-engine/bpmn-js-custom-bundle';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, inject, observable} from 'aurelia-framework';
import {diff} from 'bpmn-js-differ';

import {IBpmnModdle,
        IBpmnModeler,
        IDefinition,
        IDiagramExportService,
        IDiagramPrintService,
        IEditorActions,
        IEventFunction,
        IKeyboard,
        IProcessDefEntity,
        NotificationType,
      } from '../../contracts/index';

import environment from '../../environment';
import {NotificationService} from './../notification/notification.service';
import {DiagramExportService, DiagramPrintService} from './services/index';

import * as download from 'downloadjs';

const sideBarRightSize: number = 35;

@inject('NotificationService', EventAggregator)
export class BpmnIo {
  public modeler: IBpmnModeler;

  public toggleButtonPropertyPanel: HTMLButtonElement;
  public resizeButton: HTMLButtonElement;
  public canvasModel: HTMLDivElement;
  public propertyPanel: HTMLElement;

  @bindable() public xml: string;
  @bindable({changeHandler: 'nameChanged'}) public name: string;

  public savedXml: string;
  public propertyPanelDisplay: string = 'inline';
  public initialLoadingFinished: boolean = false;
  public showXMLView: boolean = false;
  public showDiffView: boolean = false;
  public xmlChanges: Object;
  public colorPickerLoaded: boolean = false;
  @observable public propertyPanelWidth: number;
  public minCanvasWidth: number = 100;
  public minPropertyPanelWidth: number = 200;

  private _propertyPanelShouldOpen: boolean = false;
  private _propertyPanelHiddenForSpaceReasons: boolean = false;
  private _propertyPanelHasNoSpace: boolean = false;

  private _notificationService: NotificationService;
  private _eventAggregator: EventAggregator;
  private _subscriptions: Array<Subscription>;
  private _diagramIsValid: boolean = true;
  private _diagramPrintService: IDiagramPrintService;
  private _diagramExportService: IDiagramExportService;

  private _svg: string;

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
      additionalModules: [
        bundle.MiniMap,
        bundle.ZoomScrollModule,
        bundle.MoveCanvasModule,
      ],
      moddleExtensions: {
        camunda: bundle.camundaModdleDescriptor,
      },
      keyboard: {
        bindTo: document,
      },
    });

    this._addRemoveWithBackspaceKeyboardListener();

    /**
     * Subscribe to "commandStack.changed"-event to have a simple indicator of
     * when a diagram is changed.
     */
    const handlerPriority: number = 1000;

    this.modeler.on('commandStack.changed', () => {
      this._eventAggregator.publish(environment.events.diagramChange);
    }, handlerPriority);

    this._diagramPrintService = new DiagramPrintService(this._svg);
    this._diagramExportService = new DiagramExportService();
  }

  public async attached(): Promise<void> {
    const xmlIsEmpty: boolean = this.xml !== undefined && this.xml !== null;
    if (xmlIsEmpty) {
      this.modeler.importXML(this.xml, async(err: Error) => {
        this.savedXml = await this.getXML();
      });
    }

    this.modeler.attachTo(this.canvasModel);

    window.addEventListener('resize', this._resizeEventHandler);

    this.initialLoadingFinished = true;

    this.resizeButton.addEventListener('mousedown', (e: Event) => {
      const windowEvent: Event = e || window.event;
      windowEvent.cancelBubble = true;

      const mousemoveFunction: IEventFunction = (event: MouseEvent): void => {
        this.resize(event);
        document.getSelection().empty();
      };

      const mouseUpFunction: IEventFunction = (): void => {
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
    document.addEventListener('keydown', this._printHotkeyEventHandler);

    this._hideOrShowPpForSpaceReasons();

    this._subscriptions = [
      this._eventAggregator.subscribe(environment.events.processSolutionPanel.toggleProcessSolutionExplorer, () => {
        this._hideOrShowPpForSpaceReasons();
      }),

      this._eventAggregator.subscribe(environment.events.bpmnio.toggleXMLView, () => {
        this.toggleXMLView();
        setTimeout(() => { // This makes the function gets called after the XMLView is toggled
          this._hideOrShowPpForSpaceReasons();
        }, 0);
      }),

      this._eventAggregator.subscribe(environment.events.bpmnio.toggleDiffView, () => {
        this.toggleDiffView();
        setTimeout(() => { // This makes the function gets called after the XMLView is toggled
          this._hideOrShowPpForSpaceReasons();
        }, 0);
      }),

      this._eventAggregator.subscribe(environment.events.navBar.enableSaveButton, () => {
        this._diagramIsValid = true;
      }),
      this._eventAggregator.subscribe(environment.events.navBar.disableSaveButton, () => {
        this._diagramIsValid = false;
      }),
      this._eventAggregator.subscribe(`${environment.events.processDefDetail.exportDiagramAs}:BPMN`, async(process: IProcessDefEntity) => {
        const xml: string = await this.getXML();
        const bpmn: string = await this._diagramExportService.exportBPMN(xml);

        download(bpmn, `${this.name}.bpmn`, 'application/bpmn20-xml');
      }),
      this._eventAggregator.subscribe(`${environment.events.processDefDetail.exportDiagramAs}:SVG`, async(process: IProcessDefEntity) => {
        const svg: string = await this.getSVG();

        download(svg, `${this.name}.svg`, 'image/svg+xml');
      }),
      this._eventAggregator.subscribe(`${environment.events.processDefDetail.exportDiagramAs}:PNG`, async(process: IProcessDefEntity) => {
        const svg: string = await this.getSVG();
        const png: string = await this._diagramExportService.exportPNG(svg);

        download(png, `${this.name}.png`, 'image/png');
      }),
      this._eventAggregator.subscribe(`${environment.events.processDefDetail.exportDiagramAs}:JPEG`, async(process: IProcessDefEntity) => {
        const svg: string = await this.getSVG();
        const jpeg: string = await this._diagramExportService.exportPNG(svg);

        download(jpeg, `${this.name}.jpeg`, 'image/jpeg');
      }),
      this._eventAggregator.subscribe(`${environment.events.processDefDetail.printDiagram}`, async() => {
        const svgContent: string = await this.getSVG();

        this._diagramPrintService.printDiagram(svgContent);
      }),

      this._eventAggregator.subscribe(environment.events.processDefDetail.saveDiagram, async() => {
        this.savedXml = await this.getXML();
      }),
    ];

    const previousPropertyPanelWidth: string = window.localStorage.getItem('propertyPanelWidth');

    /*
     * Update the property panel width;
     * if no previous width was found, take the configured one.
     */
    this.propertyPanelWidth = (previousPropertyPanelWidth !== undefined) ?
                              parseInt(previousPropertyPanelWidth) :
                              environment.propertyPanel.defaultWidth;

    const propertyPanelHideState: string = window.localStorage.getItem('propertyPanelHideState');
    const wasPropertyPanelVisible: boolean = propertyPanelHideState === null || propertyPanelHideState === 'show';
    this._propertyPanelShouldOpen = wasPropertyPanelVisible;
    this.togglePanel();
  }

  public detached(): void {
    this.modeler.detach();
    this.modeler.destroy();
    window.removeEventListener('resize', this._resizeEventHandler);
    document.removeEventListener('keydown', this._saveHotkeyEventHandler);
    document.removeEventListener('keydown', this._printHotkeyEventHandler);

    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
  }

  public nameChanged(newValue: string): void {
    if (this.modeler !== undefined && this.modeler !== null) {
      this.name = newValue;
    }
  }

  public propertyPanelWidthChanged(newValue: number): void {
    if (newValue !== undefined) {
      window.localStorage.setItem('propertyPanelWidth', '' + this.propertyPanelWidth);
    }
  }

  public togglePanel(): void {
    if (this._propertyPanelShouldOpen) {
      if (this._propertyPanelHasNoSpace) {
        this._notificationService.showNotification(NotificationType.ERROR, 'There is not enough space for the property panel!');
        return;
      }

      this.toggleButtonPropertyPanel.classList.add('tool--active');
      this.propertyPanelDisplay = 'inline';
      this._propertyPanelShouldOpen = false;
      window.localStorage.setItem('propertyPanelHideState', 'show');
    } else {

      this.toggleButtonPropertyPanel.classList.remove('tool--active');
      this.propertyPanelDisplay = 'none';
      this._propertyPanelShouldOpen = true;
      window.localStorage.setItem('propertyPanelHideState', 'hide');
    }
  }

  public async toggleDiffView(): Promise<void> {
    if (!this.showDiffView) {
      await this._updateXmlChanges();
      this.showDiffView = true;
    } else {
      this.showDiffView = false;
    }
  }

  public resize(event: MouseEvent): void {
    const mousePosition: number = event.clientX;

    this._setNewPropertyPanelWidthFromMousePosition(mousePosition);
  }

  public async toggleXMLView(): Promise<void> {
    if (this.showXMLView) {
      this.xml = await this.getXML();
    }

    this.showXMLView = !this.showXMLView;
  }

  public async getXML(): Promise<string> {
    const returnPromise: Promise<string> = new Promise((resolve: Function, reject: Function): void => {
      this.modeler.saveXML({}, (error: Error, result: string) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
    });
    return returnPromise;
  }

  private async _updateXmlChanges(): Promise<void> {
    this.xml = await this.getXML();

    const previousDefinitions: IDefinition = await this._getDefintionsFromXml(this.savedXml);
    const newDefinitions: IDefinition = await this._getDefintionsFromXml(this.xml);

    this.xmlChanges = diff(previousDefinitions, newDefinitions);
  }

  private async _getDefintionsFromXml(xml: string): Promise<any> {
    return new Promise((resolve: Function, reject: Function): void => {
      const moddle: IBpmnModdle =  this.modeler.get('moddle');

      moddle.fromXML(xml, (error: Error, definitions: IDefinition) => {
        if (error) {
          reject(error);
        }

        resolve(definitions);
      });
    });
  }

  private _setNewPropertyPanelWidthFromMousePosition(mousePosition: number): void {
    const propertyPanelMaxWidth: number = this.propertyPanel.parentElement.offsetWidth - this.minCanvasWidth;
    const mousePositionFromRight: number = document.body.clientWidth - mousePosition;
    const resizedWidth: number = mousePositionFromRight - sideBarRightSize;

    /*
     * This is needed to stop the width from increasing too far
     * the property panel would not be displayed with that width,
     * but when increasing the browser width, the property panel
     * then may also increase.
     */
    const newPropertyPanelWidth: number = Math.min(resizedWidth, propertyPanelMaxWidth);

    this.propertyPanelWidth = newPropertyPanelWidth;
  }

  private _hidePropertyPanelForSpaceReasons(): void {
    this._propertyPanelHasNoSpace = true;
    const propertyPanelIsOpen: boolean = !this._propertyPanelShouldOpen;

    if (propertyPanelIsOpen) {
      this._propertyPanelHiddenForSpaceReasons = true;
      this.togglePanel();
    }
  }

  private _showPropertyPanelForSpaceReasons(): void {
    this._propertyPanelHasNoSpace = false;
    this._propertyPanelHiddenForSpaceReasons = false;

    this._propertyPanelShouldOpen = true;
    this.togglePanel();
  }

  private _resizeEventHandler = (event: MouseEvent): void => {
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
    // On macOS the 'common control key' is the meta instead of the control key. So on a mac we need to find
    // out, if the meta key instead of the control key is pressed.
    const currentPlatformIsMac: boolean = this._checkIfCurrentPlatformIsMac();
    const metaKeyIsPressed: boolean = currentPlatformIsMac ? event.metaKey : event.ctrlKey;

    /*
    * If both keys (meta and s) are pressed, save the diagram.
    * A diagram is saved, by throwing a saveDiagram event.
    *
    * @see environment.events.processDefDetail.saveDiagram
    */
    const sKeyIsPressed: boolean = event.key === 's';
    const userDoesNotWantToSave: boolean = !(metaKeyIsPressed && sKeyIsPressed);

    if (userDoesNotWantToSave) {
      return;
    }

    // Prevent the browser from handling the default action for CTRL + s.
    event.preventDefault();

    this._eventAggregator.publish(environment.events.processDefDetail.saveDiagram);
  }

  /**
   * On macOS it is typically to remove elements with the backspace instead
   * of the delete key. This Method binds the removal of a selected
   * element to the backspace key, if the current platform is macOS.
   */
  private _addRemoveWithBackspaceKeyboardListener(): void {
    const currentPlatformIsNotMac: boolean = !this._checkIfCurrentPlatformIsMac();

    if (currentPlatformIsNotMac) {
      return;
    }

    const keyboard: IKeyboard = this.modeler.get('keyboard');
    const editorActions: IEditorActions = this.modeler.get('editorActions');
    const backSpaceKeyCode: number = 8;
    const removeSelectedElements: ((key: number, modifiers: KeyboardEvent) => boolean) = (key: number, modifiers: KeyboardEvent): boolean => {
      if (key === backSpaceKeyCode) {
        editorActions.trigger('removeSelection');
        return true;
      }
    };

    keyboard.addListener(removeSelectedElements);
  }

  /**
   * Handles a key down event and prints the diagram, when the user presses CRTL + p.
   *
   * If using macOS, this combination will be CMD + p.
   *
   * Printing is triggered by emitting @see environment.events.processDefDetail.printDiagram
   *
   * @param event Passed key event.
   * @return void
   */
  private _printHotkeyEventHandler = (event: KeyboardEvent): void  => {
    // On macOS the 'common control key' is the meta instead of the control key. So on a mac we need to find
    // out, if the meta key instead of the control key is pressed.
    const currentPlatformIsMac: boolean = this._checkIfCurrentPlatformIsMac();
    const metaKeyIsPressed: boolean = currentPlatformIsMac ? event.metaKey : event.ctrlKey;

    /*
     * If both keys (meta and p) are pressed, print the diagram.
     * A diagram is printed, by throwing a printDiagram event.
     *
     * @see environment.events.processDefDetail.printDiagram
     */
    const pKeyIsPressed: boolean = event.key === 'p';
    const userWantsToPrint: boolean = metaKeyIsPressed && pKeyIsPressed;

    if (userWantsToPrint) {
      // Prevent the browser from handling the default action for CMD/CTRL + p.
      event.preventDefault();

      // TODO: Handle the promise properly
      this.getSVG().then((svg: string): void => {
        this._diagramPrintService.printDiagram(svg);
      });
    }
  }

  /**
   * Checks, if the current platform is a macOS.
   *
   * @returns true, if the current platform is macOS
   */
  private _checkIfCurrentPlatformIsMac = (): boolean => {
    const macRegex: RegExp = /.*mac*./i;
    const currentPlatform: string = navigator.platform;
    const currentPlatformIsMac: boolean = macRegex.test(currentPlatform);

    return currentPlatformIsMac;
  }

  private async getSVG(): Promise<string> {
    const returnPromise: Promise<string> = new Promise((resolve: Function, reject: Function): void => {
      this.modeler.saveSVG({}, (error: Error, result: string) => {
        if (error) {
          reject(error);
        }

        resolve(result);
      });
    });

    return returnPromise;
  }
}
