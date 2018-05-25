import * as bundle from '@process-engine/bpmn-js-custom-bundle';
import {bindable, inject, observable} from 'aurelia-framework';
import * as $ from 'jquery';
import 'spectrum-colorpicker/spectrum';
import {setTimeout} from 'timers';
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

@inject('NotificationService')
export class BpmnIo {
  private toggled: boolean = false;
  private toggleButtonPropertyPanel: HTMLButtonElement;
  private resizeButton: HTMLButtonElement;
  private canvasModel: HTMLDivElement;
  private refresh: boolean = true;
  private isResizeClicked: boolean = false;
  private showXMLView: boolean = false;

  private resizeButtonRight: number = 285;
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

  @bindable({changeHandler: 'xmlChanged'}) public xml: string;

  public initialLoadingFinished: boolean;
  public modeler: IBpmnModeler;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
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
  }

  public detached(): void {
    this.modeler.detach();
    this.modeler.destroy();
    window.removeEventListener('resize', this.resizeEventHandler);
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

  public distributeElements(option: ElementDistributeOptions): void {
    const distribute: IBpmnFunction = this.modeler.get('distributeElements');

    const selectedElements: Array<IShape> = this.getSelectedElements();

    distribute.trigger(selectedElements, option);
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

    this.resizeButtonRight = currentWidth + sideBarRightSize;
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

  public distributeElementsHorizontal(): void {
    this.distributeElements(ElementDistributeOptions.HORIZONTAL);
  }

  public distributeElementsVertical(): void {
    this.distributeElements(ElementDistributeOptions.VERTICAL);
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

    this.ppWidth = this.lastPpWidth;
    if (this.ppWidth > this.maxWidth) {
      const currentWidth: number = this.maxWidth;

      this.resizeButtonRight = currentWidth + sideBarRightSize;
      this.canvasRight = currentWidth;
      this.ppWidth = currentWidth;
    } else {
      this.resizeButtonRight = this.lastPpWidth + sideBarRightSize;
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

}
