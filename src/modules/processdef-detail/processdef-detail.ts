import {bindingMode} from 'aurelia-binding';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, computedFrom, inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {ValidateEvent, ValidationController} from 'aurelia-validation';

import * as canvg from 'canvg-browser';
import * as download from 'downloadjs';
import * as $ from 'jquery';
import * as beautify from 'xml-beautifier';

import {IProcessDefEntity} from '@process-engine/process_engine_contracts';
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

  private _processEngineService: IProcessEngineService;
  private _notificationService: NotificationService;
  private _eventAggregator: EventAggregator;
  private _subscriptions: Array<Subscription>;
  private _processId: string;
  private _process: IProcessDefEntity;
  private _router: Router;
  private _diagramHasChanged: boolean = false;
  private _validationController: ValidationController;

  public bpmn: BpmnIo;

  @bindable() public uri: string;
  @bindable() public name: string;
  @bindable() public startedProcessId: string;
  @bindable({ defaultBindingMode: bindingMode.oneWay }) public initialLoadingFinished: boolean = false;

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
    await this.refreshProcess();
  }

  public attached(): void {
    this._validationController.subscribe((event: ValidateEvent) => {
      this.validateForm(event);
    });

    this._subscriptions = [
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this.refreshProcess();
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this.refreshProcess();
      }),
      this._eventAggregator.subscribe(environment.events.processDefDetail.saveDiagram, () => {
        this.saveDiagram();
      }),
      this._eventAggregator.subscribe(`${environment.events.processDefDetail.exportDiagramAs}:BPMN`, () => {
        this.exportBPMN();
      }),
      this._eventAggregator.subscribe(`${environment.events.processDefDetail.exportDiagramAs}:SVG`, () => {
        this.exportSVG();
      }),
      this._eventAggregator.subscribe(`${environment.events.processDefDetail.exportDiagramAs}:PNG`, () => {
        this.exportPNG();
      }),
      this._eventAggregator.subscribe(`${environment.events.processDefDetail.exportDiagramAs}:JPEG`, () => {
        this.exportJPEG();
      }),
      this._eventAggregator.subscribe(environment.events.processDefDetail.startProcess, () => {
        this.startProcess();
      }),
      this._eventAggregator.subscribe(environment.events.diagramChange, () => {
        this._diagramHasChanged = true;
      }),
    ];

    this._eventAggregator.publish(environment.events.navBar.showTools, this.process);
    this._eventAggregator.publish(environment.events.statusBar.showXMLButton);
  }

  public canDeactivate(): Promise<boolean> {

    return new Promise((resolve: Function, reject: Function): void => {
      if (!this._diagramHasChanged) {
        resolve(true);
        return;
      }

      const modal: HTMLElement = document.getElementById('saveModal');
      modal.classList.add('show-modal');

      document.getElementById('dontSaveButton').addEventListener('click', () => {
        modal.classList.remove('show-modal');
        resolve(true);
      });
      document.getElementById('saveButton').addEventListener('click', () => {
        this.saveDiagram();
        modal.classList.remove('show-modal');
        resolve(true);
      });
      document.getElementById('cancelButton').addEventListener('click', () => {
        modal.classList.remove('show-modal');
        resolve(false);
      });

    });
  }

  public detached(): void {
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }

    this._eventAggregator.publish(environment.events.navBar.hideTools);
    this._eventAggregator.publish(environment.events.statusBar.hideXMLButton);
  }

  private refreshProcess(): Promise<IProcessDefEntity> {
    return this._processEngineService.getProcessDefById(this._processId)
      .then((result: any) => {
        if (result && !result.error) {
          this._process = result;

          this._eventAggregator.publish(environment.events.navBar.updateProcess, this._process);

          return this._process;
        } else {
          this._process = null;
          return result.error;
        }
    });
  }

  public startProcess(): void {
    this.validateXML();
    this._router.navigate(`processdef/${this.process.id}/start`);
  }

  public deleteProcess(): void {
    const deleteForReal: boolean = confirm('Are you sure you want to delete the process definition?');
    if (!deleteForReal) {
      return;
    }
    this._processEngineService.deleteProcessDef(this.process.id)
      .then(() => {
        this._process = null;
        this._router.navigate('');
      })
      .catch((error: Error) => {
        this._notificationService.showNotification(NotificationType.ERROR, error.message);
      });
  }

  @computedFrom('_process')
  public get process(): IProcessDefEntity {
    return this._process;
  }

  public onModdlelImported(moddle: any, xml: string): void {
    this.bpmn.xml = xml;
  }

  public async saveDiagram(): Promise<void> {

    this.validateXML();

    try {
      const xml: string = await this.bpmn.getXML();
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

  private validateXML(): void {
    const registry: Array<IShape> = this.bpmn.modeler.get('elementRegistry');

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

  public async exportBPMN(): Promise<void> {
    const xml: string = await this.bpmn.getXML();
    const formattedXml: string = beautify(xml);
    download(formattedXml, `${this.process.name}.bpmn`, 'application/bpmn20-xml');
  }

  public async exportSVG(): Promise<void> {
    const svg: string = await this.bpmn.getSVG();
    download(svg, `${this.process.name}.svg`, 'image/svg+xml');
  }

  public async exportPNG(): Promise<void> {
    const svg: string = await this.bpmn.getSVG();
    download(this.generateImageFromSVG('png', svg), `${this.process.name}.png`, 'image/png');
  }

  public async exportJPEG(): Promise<void> {
    const svg: string = await this.bpmn.getSVG();
    download(this.generateImageFromSVG('jpeg', svg), `${this.process.name}.jpeg`, 'image/jpeg');
  }

  public generateImageFromSVG(desiredImageType: string, svg: any): string {
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

  private validateForm(event: ValidateEvent): void {
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
