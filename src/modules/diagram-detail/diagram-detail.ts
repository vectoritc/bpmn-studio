import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Redirect, Router} from 'aurelia-router';

import {IDiagram} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';
import * as canvg from 'canvg-browser';
import * as download from 'downloadjs';
import * as print from 'print-js';
import * as beautify from 'xml-beautifier';

import {ICanvgOptions} from '../../contracts';
import environment from '../../environment';
import {BpmnIo} from '../bpmn-io/bpmn-io';

interface RouteParameters {
  diagramName: string;
}

@inject('SolutionExplorerServiceFileSystem', EventAggregator)
export class DiagramDetail {

  public diagram: IDiagram;
  public bpmnio: BpmnIo;

  private _solutionExplorerService: ISolutionExplorerService;
  private _eventAggregator: EventAggregator;
  private _subscriptions: Array<Subscription>;
  private _router: Router;
  private _diagramHasChanged: boolean;

  constructor(solutionExplorerService: ISolutionExplorerService, eventAggregator: EventAggregator, router: Router) {
    this._solutionExplorerService = solutionExplorerService;
    this._eventAggregator = eventAggregator;
    this._router = router;
  }

  public async activate(routeParameters: RouteParameters): Promise<void> {
    this.diagram = await this._solutionExplorerService.loadDiagram(routeParameters.diagramName);

    this._diagramHasChanged = false;
  }

  public attached(): void {
    this._eventAggregator.publish(environment.events.navBar.showTools, this.diagram);
    this._eventAggregator.publish(environment.events.statusBar.showXMLButton);

    this._subscriptions = [
      this._eventAggregator.subscribe(environment.events.processDefDetail.saveDiagram, () => {
        this._saveDiagram();
      }),
      this._eventAggregator.subscribe(environment.events.diagramChange, () => {
        this._diagramHasChanged = true;
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
      this._eventAggregator.subscribe(environment.events.processDefDetail.printDiagram, () => {
        this._printDiagram();
      }),
    ];
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

  private async _saveDiagram(): Promise<void> {
    this.diagram.xml = await this.bpmnio.getXML();
    this._solutionExplorerService.saveDiagram(this.diagram);
    this._diagramHasChanged = false;
  }

  private async _exportBPMN(): Promise<void> {
    const xml: string = await this.bpmnio.getXML();
    const formattedXml: string = beautify(xml);

    download(formattedXml, `${this.diagram.name}.bpmn`, 'application/bpmn20-xml');
  }

  private async _exportSVG(): Promise<void> {
    const svg: string = await this.bpmnio.getSVG();

    download(svg, `${this.diagram.name}.svg`, 'image/svg+xml');
  }

  private async _exportPNG(): Promise<void> {
    const svg: string = await this.bpmnio.getSVG();

    download(this._generateImageFromSVG('png', svg), `${this.diagram.name}.png`, 'image/png');
  }

  private async _exportJPEG(): Promise<void> {
    const svg: string = await this.bpmnio.getSVG();

    download(this._generateImageFromSVG('jpeg', svg), `${this.diagram.name}.jpeg`, 'image/jpeg');
  }

  public async _printDiagram(): Promise<void> {
    const svg: string = await this.bpmnio.getSVG();
    const png: string = this._generateImageFromSVG('png', svg);

    print.default({printable: png, type: 'image'});
  }

  private _generateImageFromSVG(desiredImageType: string, svg: any): string {
    const encoding: string = `image/${desiredImageType}`;
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    const context: CanvasRenderingContext2D = canvas.getContext('2d');

    const svgWidth: number = parseInt(svg.match(/<svg[^>]*width\s*=\s*\"?(\d+)\"?[^>]*>/)[1]);
    const svgHeight: number = parseInt(svg.match(/<svg[^>]*height\s*=\s*\"?(\d+)\"?[^>]*>/)[1]);

    const pixelRatio: number = window.devicePixelRatio || 1;

    canvas.width = svgWidth * pixelRatio;
    canvas.height = svgHeight * pixelRatio;

    const canvgOptions: ICanvgOptions = {
      ignoreDimensions: true,
      scaleWidth: canvas.width,
      scaleHeight: canvas.height,
    };

    canvg(canvas, svg, canvgOptions);

    // make the background white for every format
    context.globalCompositeOperation = 'destination-over';
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const image: string = canvas.toDataURL(encoding); // returns a base64 datastring
    return image;
  }
}
