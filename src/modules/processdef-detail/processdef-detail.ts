import {BpmnStudioClient} from '@process-engine/bpmn-studio_client';
import {IProcessDefEntity} from '@process-engine/process_engine_contracts';
import {bindingMode} from 'aurelia-binding';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, computedFrom, inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {ValidateEvent, ValidationController} from 'aurelia-validation';
import * as canvg from 'canvg-browser';
import * as download from 'downloadjs';
import * as $ from 'jquery';
import 'spectrum-colorpicker/spectrum';
import * as toastr from 'toastr';
import * as beautify from 'xml-beautifier';
import {AuthenticationStateEvent,
        ElementDistributeOptions,
        IExtensionElement,
        IFormElement,
        IModdleElement,
        IProcessEngineService,
        IShape} from '../../contracts/index';
import environment from '../../environment';
import {BpmnIo} from '../bpmn-io/bpmn-io';

interface RouteParameters {
  processDefId: string;
}

@inject('ProcessEngineService', EventAggregator, 'BpmnStudioClient', Router, ValidationController)
export class ProcessDefDetail {

  private processEngineService: IProcessEngineService;
  private eventAggregator: EventAggregator;
  private subscriptions: Array<Subscription>;
  private processId: string;
  private _process: IProcessDefEntity;
  private bpmn: BpmnIo;
  private exportButton: HTMLButtonElement;
  private exportSpinner: HTMLElement;
  private startButtonDropdown: HTMLDivElement;
  private startButton: HTMLButtonElement;
  private saveButton: HTMLButtonElement;
  private bpmnStudioClient: BpmnStudioClient;
  private router: Router;

  public validationController: ValidationController;
  public validationError: boolean;

  @bindable() public uri: string;
  @bindable() public name: string;
  @bindable() public startedProcessId: string;
  @bindable({ defaultBindingMode: bindingMode.oneWay }) public initialLoadingFinished: boolean = false;

  constructor(processEngineService: IProcessEngineService,
              eventAggregator: EventAggregator,
              bpmnStudioClient: BpmnStudioClient,
              router: Router,
              validationController: ValidationController) {
    this.processEngineService = processEngineService;
    this.eventAggregator = eventAggregator;
    this.bpmnStudioClient = bpmnStudioClient;
    this.router = router;
    this.validationController = validationController;
  }

  public async activate(routeParameters: RouteParameters): Promise<void> {
    this.processId = routeParameters.processDefId;
    await this.refreshProcess();
  }

  public attached(): void {
    this.validationController.subscribe((event: ValidateEvent) => {
      this.validateForm(event);
    });

    this.subscriptions = [
      this.eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this.refreshProcess();
      }),
      this.eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this.refreshProcess();
      }),
    ];
  }

  public detached(): void {
    for (const subscription of this.subscriptions) {
      subscription.dispose();
    }
  }

  private refreshProcess(): Promise<IProcessDefEntity> {
    return this.processEngineService.getProcessDefById(this.processId)
      .then((result: any) => {
        if (result && !result.error) {
          this._process = result;
          return this._process;
        } else {
          this._process = null;
          return result.error;
        }
    });
  }

  public startProcess(): void {
    if (!this.startButton.disabled) {
     this.router.navigate(`processdef/${this.process.id}/start`);
    }
  }

  public closeProcessStartDropdown(): void {
    this.startButton.removeAttribute('disabled');
  }

  public deleteProcess(): void {
    const deleteForReal: boolean = confirm('Are you sure you want to delete the process definition?');
    if (!deleteForReal) {
      return;
    }
    this.processEngineService.deleteProcessDef(this.process.id)
      .then(() => {
        this._process = null;
        this.router.navigate('');
      })
      .catch((error: Error) => {
        toastr.error(error.message);
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
    if (this.saveButton.disabled) {
      return;
    }
    this.validateXML();

    try {
      const xml: string = await this.bpmn.getXML();
      const response: any = await this.processEngineService.updateProcessDef(this.process, xml);

      if (response.error) {
        toastr.error(`Error while saving file: ${response.error}`);
      } else if (response.result) {
        toastr.success('File saved.');
      } else {
        toastr.warning(`Unknown error: ${JSON.stringify(response)}`);
      }
    } catch (error) {
      toastr.error(`Error: ${error.message}`);
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
    this.disableAndHideControlsForImageExport();

    const xml: string = await this.bpmn.getXML();
    const formattedXml: string = beautify(xml);
    download(formattedXml, `${this.process.name}.bpmn`, 'application/bpmn20-xml');

    this.enableAndShowControlsForImageExport();
  }

  public async exportSVG(): Promise<void> {
    this.disableAndHideControlsForImageExport();

    const svg: string = await this.bpmn.getSVG();
    download(svg, `${this.process.name}.svg`, 'image/svg+xml');

    this.enableAndShowControlsForImageExport();
  }

  public async exportPNG(): Promise<void> {
    this.disableAndHideControlsForImageExport();

    const svg: string = await this.bpmn.getSVG();
    download(this.generateImageFromSVG('png', svg), `${this.process.name}.png`, 'image/png');

    this.enableAndShowControlsForImageExport();
  }

  public async exportJPEG(): Promise<void> {
    this.disableAndHideControlsForImageExport();

    const svg: string = await this.bpmn.getSVG();
    download(this.generateImageFromSVG('jpeg', svg), `${this.process.name}.jpeg`, 'image/jpeg');

    this.enableAndShowControlsForImageExport();
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

  public goBack(): void {
    this.router.navigateBack();
  }

  private disableAndHideControlsForImageExport(): void {
    this.exportButton.setAttribute('disabled', '');
    this.exportSpinner.classList.remove('hidden');
  }

  private enableAndShowControlsForImageExport(): void {
    this.exportButton.removeAttribute('disabled');
    this.exportSpinner.classList.add('hidden');
  }

  private validateForm(event: ValidateEvent): void {
    if (event.type !== 'validate') {
      return;
    }

    this.validationError = false;

    for (const result of event.results) {
      if (result.valid === false) {
        this.validationError = true;
        return;
      }
    }
  }

}
