import {ConsumerClient} from '@process-engine/consumer_client';
import {IProcessDefEntity} from '@process-engine/process_engine_contracts';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, computedFrom, inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import * as canvg from 'canvg-browser';
import * as download from 'downloadjs';
import * as toastr from 'toastr';
import {AuthenticationStateEvent,
        ElementDistributeOptions,
        IChooseDialogOption,
        IProcessEngineService} from '../../contracts/index';
import environment from '../../environment';
import {BpmnIo} from '../bpmn-io/bpmn-io';

interface RouteParameters {
  processDefId: string;
}

@inject('ProcessEngineService', EventAggregator, 'ConsumerClient', Router)
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

  @bindable() public uri: string;
  @bindable() public name: string;
  @bindable() public startedProcessId: string;

  constructor(processEngineService: IProcessEngineService,
              eventAggregator: EventAggregator,
              consumerClient: ConsumerClient,
              router: Router) {
    this.processEngineService = processEngineService;
    this.eventAggregator = eventAggregator;
    this.consumerClient = consumerClient;
    this.router = router;
  }

  public activate(routeParameters: RouteParameters): void {
    this.processId = routeParameters.processDefId;
    this.refreshProcess();
  }

  public attached(): void {
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
    if (this.startButton.hasAttribute('disabled')) {
      return;
    }
    this.startButton.setAttribute('disabled', 'disabled');
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

  public saveDiagram(): void {
    this.bpmn.getXML().then((xml: string) => {
      return this.processEngineService.updateProcessDef(this.process, xml);
    }).then((response: any) => {
      if (response.error) {
        toastr.error(`Error while saving file: ${response.error}`);
      } else if (response.result) {
        toastr.success('File saved.');
      } else {
        toastr.warning(`Unknown error: ${JSON.stringify(response)}`);
      }
    }).catch((error: Error) => {
      toastr.error(`Error: ${error.message}`);
    });
  }

  public exportBPMN(): void {
    this.disableAndHideControlsForImageExport();
    this.bpmn.getXML().then((xml: string) => {
      download(xml, `${this.process.name}.bpmn`, 'application/bpmn20-xml');
      this.enableAndShowControlsForImageExport();
    });

  }

  public exportSVG(): void {
    this.disableAndHideControlsForImageExport();

    this.bpmn.getSVG()
    .then((svg: string) => {
      download(svg, `${this.process.name}.svg`, 'image/svg+xml');

      this.enableAndShowControlsForImageExport();
    });
  }

  public exportPNG(): void {
    this.disableAndHideControlsForImageExport();

    this.bpmn.getSVG()
    .then((svg: string) => {
      download(this.generateImageFromSVG('png', svg), `${this.process.name}.png`, 'image/png');

      this.enableAndShowControlsForImageExport();
    });
  }

  public exportJPEG(): void {
    this.disableAndHideControlsForImageExport();

    this.bpmn.getSVG()
    .then((svg: string) => {
      download(this.generateImageFromSVG('jpeg', svg), `${this.process.name}.jpeg`, 'image/jpeg');

      this.enableAndShowControlsForImageExport();
    });
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

  public async publishDraft(): Promise<any> {
    this.processEngineService.publishDraft(this._process.id).then((processDef: IProcessDefEntity) => {
      this.refreshProcess();
      toastr.success('Successfully published!');
    }).catch((error: Error) => {
      toastr.error(`Error while publishing Draft: ${error.message}`);
    });
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

  public setColorWhite(): void {
    this.bpmn.setColor(null, null);
  }

}
