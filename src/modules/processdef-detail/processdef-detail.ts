import {bindingMode} from 'aurelia-binding';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, computedFrom, inject} from 'aurelia-framework';
import {Redirect, RedirectToRoute, Router} from 'aurelia-router';
import {ValidateEvent, ValidationController} from 'aurelia-validation';

import {IProcessDefEntity} from '@process-engine/process_engine_contracts';
import * as canvg from 'canvg-browser';
import * as download from 'downloadjs';
import * as $ from 'jquery';
import * as print from 'print-js';
import * as beautify from 'xml-beautifier';

import {
  AuthenticationStateEvent,
  ElementDistributeOptions,
  IExtensionElement,
  IFormElement,
  IModdleElement,
  IProcessEngineService,
  IShape,
  NotificationType,
} from '../../contracts/index';
import environment from '../../environment';
import {BpmnIo} from '../bpmn-io/bpmn-io';
import {NotificationService} from './../notification/notification.service';

interface RouteParameters {
  processDefId: string;
}

@inject('ProcessEngineService', EventAggregator, Router, ValidationController, 'NotificationService')
export class ProcessDefDetail {

  public bpmnio: BpmnIo;
  public process: IProcessDefEntity;

  private _processEngineService: IProcessEngineService;
  private _notificationService: NotificationService;
  private _eventAggregator: EventAggregator;
  private _subscriptions: Array<Subscription>;
  private _processId: string;
  private _router: Router;
  private _diagramHasChanged: boolean = false;
  private _validationController: ValidationController;

  constructor(processEngineService: IProcessEngineService,
              eventAggregator: EventAggregator,
              router: Router,
              validationController: ValidationController,
              notificationService: NotificationService) {
    this._processEngineService = processEngineService;
    this._eventAggregator = eventAggregator;
    this._router = router;
    this._validationController = validationController;
    this._notificationService = notificationService;
  }

  public async activate(routeParameters: RouteParameters): Promise<void> {
    this._processId = routeParameters.processDefId;
    this._diagramHasChanged = false;
    await this._refreshProcess();
  }

  public attached(): void {
    this._validationController.subscribe((event: ValidateEvent) => {
      this._validateForm(event);
    });

    this._subscriptions = [
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this._refreshProcess();
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this._refreshProcess();
      }),
      this._eventAggregator.subscribe(environment.events.processDefDetail.saveDiagram, () => {
        this._saveDiagram();
      }),
      this._eventAggregator.subscribe(`${environment.events.processDefDetail.exportDiagramAs}:BPMN`, () => {
        this._exportBPMN();
      }),
      this._eventAggregator.subscribe(`${environment.events.processDefDetail.exportDiagramAs}:SVG`, () => {
        this._exportSVG();
      }),
      this._eventAggregator.subscribe(`${environment.events.processDefDetail.exportDiagramAs}:PNG`, () => {
        this._exportPNG();
      }),
      this._eventAggregator.subscribe(`${environment.events.processDefDetail.exportDiagramAs}:JPEG`, () => {
        this._exportJPEG();
      }),
      this._eventAggregator.subscribe(environment.events.processDefDetail.startProcess, () => {
        this._startProcess();
      }),
      this._eventAggregator.subscribe(environment.events.diagramChange, () => {
        this._diagramHasChanged = true;
      }),
      this._eventAggregator.subscribe(environment.events.processDefDetail.printDiagram, () => {
        this.printDiagram();
      }),
    ];

    this._eventAggregator.publish(environment.events.navBar.showTools, this.process);
    this._eventAggregator.publish(environment.events.statusBar.showXMLButton);
  }

  public async canDeactivate(): Promise<Redirect> {

    const _modal: Promise<boolean> = new Promise((resolve: Function, reject: Function): any => {
      if (!this._diagramHasChanged) {
        resolve(true);
      } else {

        const modal: HTMLElement = document.getElementById('saveModal');
        modal.classList.add('show-modal');

        // register onClick handler
        document.getElementById('dontSaveButton').addEventListener('click', () => {
          modal.classList.remove('show-modal');
          this._diagramHasChanged = false;
          resolve(true);
        });
        document.getElementById('saveButton').addEventListener('click', () => {
          this._saveDiagram();
          modal.classList.remove('show-modal');
          this._diagramHasChanged = false;
          resolve(true);
        });
        document.getElementById('cancelButton').addEventListener('click', () => {
          modal.classList.remove('show-modal');
          resolve(false);
        });
      }
    });

    const result: boolean = await _modal;
    if (result === false) {
      /*
       * As suggested in https://github.com/aurelia/router/issues/302, we use
       * the router directly to navgiate back, which results in staying on this
       * component-- and this is the desired behaviour.
       */
      return new Redirect(this._router.currentInstruction.fragment, {trigger: false, replace: false});
    }
  }

  public detached(): void {
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }

    this._eventAggregator.publish(environment.events.navBar.hideTools);
    this._eventAggregator.publish(environment.events.statusBar.hideXMLButton);
  }

  private _refreshProcess(): Promise<IProcessDefEntity> {
    return this._processEngineService.getProcessDefById(this._processId)
      .then((result: any) => {
        if (result && !result.error) {
          this.process = result;

          this._eventAggregator.publish(environment.events.navBar.updateProcess, this.process);

          return this.process;
        } else {
          this.process = null;
          return result.error;
        }
    });
  }

  private _startProcess(): void {
    this._validateXML();
    this._router.navigate(`processdef/${this.process.id}/start`);
  }

  /**
   * Currently unused Method
   * TODO: Look deeper into this if we need this method anymore and/or in this
   * particular way.
   */

  private _deleteProcess(): void {
    const deleteForReal: boolean = confirm('Are you sure you want to delete the process definition?');
    if (!deleteForReal) {
      return;
    }
    this._processEngineService.deleteProcessDef(this.process.id)
      .then(() => {
        this.process = null;
        this._router.navigate('');
      })
      .catch((error: Error) => {
        this._notificationService.showNotification(NotificationType.ERROR, error.message);
      });
  }

  private async _saveDiagram(): Promise<void> {

    this._validateXML();

    try {
      const xml: string = await this.bpmnio.getXML();
      const response: any = await this._processEngineService.updateProcessDef(this.process, xml);

      if (response.error) {
        this._notificationService.showNotification(NotificationType.ERROR, `Error while saving file: ${response.error}`);
      } else if (response.result) {
        this._notificationService.showNotification(NotificationType.SUCCESS, 'File saved.');
      } else {
        this._notificationService.showNotification(NotificationType.WARNING, `Unknown error: ${JSON.stringify(response)}`);
      }
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, `Error: ${error.message}`);
    }
  }

  /**
   * In the current implementation this method only checks for UserTasks that have
   * empty or otherwise not allowed FormData in them.
   * If that is the case the method will continue by deleting unused/disallowed
   * FormData to make sure the diagrams xml is furhter supported by camunda.
   *
   * TODO: Look further into this if this method is not better placed at the FormsSection
   * in the Property Panel, also split this into two methods and name them right.
   */
  private _validateXML(): void {
    const registry: Array<IShape> = this.bpmnio.modeler.get('elementRegistry');

    registry.forEach((element: IShape) => {
      if (element.type === 'bpmn:UserTask') {
        const businessObj: IModdleElement = element.businessObject;

        if (businessObj.extensionElements) {
          const extensions: IExtensionElement = businessObj.extensionElements;

          extensions.values = extensions.values.filter((value: IFormElement) => {
            const keepThisValue: boolean = value.$type !== 'camunda:FormData' || value.fields.length > 0;
            return keepThisValue;
          });

          if (extensions.values.length === 0) {
            delete businessObj.extensionElements;
          }
        }
      }
    });
  }

  private async _exportBPMN(): Promise<void> {
    const xml: string = await this.bpmnio.getXML();
    const formattedXml: string = beautify(xml);

    download(formattedXml, `${this._process.name}.bpmn`, 'application/bpmn20-xml');
  }

  private async _exportSVG(): Promise<void> {
    const svg: string = await this.bpmnio.getSVG();

    download(svg, `${this.process.name}.svg`, 'image/svg+xml');
  }

  private async _exportPNG(): Promise<void> {
    const svg: string = await this.bpmnio.getSVG();

    download(this._generateImageFromSVG('png', svg), `${this.process.name}.png`, 'image/png');
  }

  private async _exportJPEG(): Promise<void> {
    const svg: string = await this.bpmnio.getSVG();

    download(this._generateImageFromSVG('jpeg', svg), `${this.process.name}.jpeg`, 'image/jpeg');
  }

  public async printDiagram(): Promise<void> {
    const svg: string = await this.bpmn.getSVG();
    const png: string = this.generateImageFromSVG('png', svg);

    print.default({printable: png, type: 'image'});
  }

  private _generateImageFromSVG(desiredImageType: string, svg: any): string {
    const encoding: string = `image/${desiredImageType}`;
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    const context: CanvasRenderingContext2D = canvas.getContext('2d');

    canvg(canvas, svg);
    // make the background white for every format
    context.globalCompositeOperation = 'destination-over';
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const image: string = canvas.toDataURL(encoding); // returns a base64 datastring
    return image;
  }

  private _validateForm(event: ValidateEvent): void {
    if (event.type !== 'validate') {
      return;
    }

    this._eventAggregator.publish(environment.events.navBar.enableSaveButton);

    for (const result of event.results) {
      if (result.valid === false) {
        this._eventAggregator.publish(environment.events.navBar.disableSaveButton);
        return;
      }
    }
  }

}
