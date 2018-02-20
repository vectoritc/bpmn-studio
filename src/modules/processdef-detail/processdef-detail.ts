import {ConsumerClient} from '@process-engine/consumer_client';
import {IProcessDefEntity} from '@process-engine/process_engine_contracts';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, computedFrom, inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {ValidateEvent, ValidateResult, ValidationController, ValidationRules} from 'aurelia-validation';
import * as canvg from 'canvg-browser';
import * as download from 'downloadjs';
import * as $ from 'jquery';
import * as spectrum from 'spectrum-colorpicker';
import 'spectrum-colorpicker/spectrum';
import * as toastr from 'toastr';
import {AuthenticationStateEvent,
        ElementDistributeOptions,
        IChooseDialogOption,
        IElementRegistry,
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

@inject('ProcessEngineService', EventAggregator, 'ConsumerClient', Router, ValidationController)
export class ProcessDefDetail {

  private processEngineService: IProcessEngineService;
  private eventAggregator: EventAggregator;
  private subscriptions: Array<Subscription>;
  private processId: string;
  private _process: IProcessDefEntity;
  private bpmn: BpmnIo;
  private exportButton: HTMLButtonElement;
  private exportDropdown: HTMLButtonElement;
  private exportSpinner: HTMLElement;
  private startButtonDropdown: HTMLDivElement;
  private startButton: HTMLElement;
  private consumerClient: ConsumerClient;
  private router: Router;
  private fillColor: string;
  private borderColor: string;

  public validationController: ValidationController;
  public validationError: boolean;

  @bindable() public uri: string;
  @bindable() public name: string;
  @bindable() public startedProcessId: string;

  constructor(processEngineService: IProcessEngineService,
              eventAggregator: EventAggregator,
              consumerClient: ConsumerClient,
              router: Router,
              validationController: ValidationController) {
    this.processEngineService = processEngineService;
    this.eventAggregator = eventAggregator;
    this.consumerClient = consumerClient;
    this.router = router;
    this.validationController = validationController;
  }

  public activate(routeParameters: RouteParameters): void {
    this.processId = routeParameters.processDefId;
    this.refreshProcess();
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

    const settings: any = {
      clickoutFiresChange: true,
      showPalette: true,
      palette: [],
      localStorageKey: 'elementColors',
      showInitial: true,
      showInput: true,
      allowEmpty: true,
      showButtons: false,
      showPaletteOnly: true,
      togglePaletteOnly: true,
    };

    $('#colorpickerBorder').spectrum(Object.assign({},
      settings,
      { move: (borderColor: any): void => this.updateBorderColor(borderColor) },
    ));

    $('#colorpickerFill').spectrum(Object.assign({},
      settings,
      { move: (fillColor: any): void => this.updateFillColor(fillColor) },
    ));
  }

  public detached(): void {
    for (const subscription of this.subscriptions) {
      subscription.dispose();
    }
  }

  private refreshProcess(): void {
    this.processEngineService.getProcessDefById(this.processId)
      .then((result: any) => {
        if (result && !result.error) {
          this._process = result;
        } else {
          this._process = null;
        }
    });
  }

  public async startProcess(): Promise<void> {
    this.router.navigate(`processdef/${this.process.id}/start`);
    this.startedProcessId = await this.consumerClient.startProcessByKey(this.process.key);
  }

  public closeProcessStartDropdown(): void {
    this.startButton.removeAttribute('disabled');
    this.startedProcessId = undefined;
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
    download(xml, `${this.process.name}.bpmn`, 'application/bpmn20-xml');

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

  private disableAndHideControlsForImageExport(): void {
    this.exportButton.setAttribute('disabled', '');
    this.exportDropdown.setAttribute('disabled', '');
    this.exportSpinner.classList.remove('hidden');
  }

  private enableAndShowControlsForImageExport(): void {
    this.exportButton.removeAttribute('disabled');
    this.exportDropdown.removeAttribute('disabled');
    this.exportSpinner.classList.add('hidden');
  }

  public distributeElementsHorizontal(): void {
    this.bpmn.distributeElements(ElementDistributeOptions.HORIZONTAL);
  }

  public distributeElementsVertical(): void {
    this.bpmn.distributeElements(ElementDistributeOptions.VERTICAL);
  }

  public setColorRed(): void {
    this.bpmn.setColor('#FFCDD2', '#E53935');
  }

  public setColorBlue(): void {
    this.bpmn.setColor('#BBDEFB', '#1E88E5');
  }

  public setColorOrange(): void {
    this.bpmn.setColor('#FFE0B2', '#FB8C00');
  }

  public setColorGreen(): void {
    this.bpmn.setColor('#C8E6C9', '#43A047');
  }

  public setColorPurple(): void {
    this.bpmn.setColor('#E1BEE7', '#8E24AA');
  }

  public removeColor(): void {
    this.bpmn.setColor(null, null);
  }

  public setColorPicked(): void {
    this.bpmn.setColor(this.fillColor, this.borderColor);
  }

  private updateFillColor(fillColor: any): void {
    if (fillColor) {
      this.fillColor = fillColor.toHexString();
    } else {
      this.fillColor = null;
    }

    this.setColorPicked();
  }

  private updateBorderColor(borderColor: any): void {
    if (borderColor) {
      this.borderColor = borderColor.toHexString();
    } else {
      this.borderColor = null;
    }

    this.setColorPicked();
  }

  public updateCustomColors(): void {
    [this.fillColor, this.borderColor] = this.bpmn.getColors();

    $('#colorpickerFill').spectrum('set', this.fillColor);
    $('#colorpickerBorder').spectrum('set', this.borderColor);
  }

  private validateForm(event: ValidateEvent): void {
    if (event.type === 'validate') {
      event.results.forEach((result: ValidateResult) => {
        if (result.valid === false) {
          this.validationError = true;
        } else {
          this.validationError = false;
        }
      });
    }
  }
}
