import * as canvg from 'canvg-browser';
import * as download from 'downloadjs';
import * as beautify from 'xml-beautifier';
import {IBpmnModeler, ICanvgOptions, IProcessDefEntity} from '../../../contracts';

export class DiagramExportService {

  private _modeler: IBpmnModeler;

  constructor(modeler: IBpmnModeler) {
    this._modeler = modeler;
  }

  public async exportBPMN(process: IProcessDefEntity): Promise<void> {
    const xml: string = await this.getXML();
    const formattedXml: string = beautify(xml);

    download(formattedXml, `${process.name}.bpmn`, 'application/bpmn20-xml');
  }

  public async exportSVG(process: IProcessDefEntity): Promise<void> {
    const svg: string = await this.getSVG();

    download(svg, `${process.name}.svg`, 'image/svg+xml');
  }

  public async exportPNG(process: IProcessDefEntity): Promise<void> {
    const svg: string = await this.getSVG();

    download(this._generateImageFromSVG('png', svg), `${process.name}.png`, 'image/png');
  }

  public async exportJPEG(process: IProcessDefEntity): Promise<void> {
    const svg: string = await this.getSVG();

    download(this._generateImageFromSVG('jpeg', svg), `${process.name}.jpeg`, 'image/jpeg');
  }

  public getXML(): Promise<string> {
    return new Promise((resolve: Function, reject: Function): void => {
      this._modeler.saveXML({}, (err: Error, result: string) => {
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
      this._modeler.saveSVG({}, (err: Error, result: string) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  private _generateImageFromSVG(desiredImageType: string, svg: any): string {
    const encoding: string = `image/${desiredImageType}`;
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    const context: CanvasRenderingContext2D = canvas.getContext('2d');

    const svgWidth: number = parseInt(svg.match(/<svg[^>]*width\s*=\s*\"?(\d+)\"?[^>]*>/)[1]);
    const svgHeight: number = parseInt(svg.match(/<svg[^>]*height\s*=\s*\"?(\d+)\"?[^>]*>/)[1]);

    // For a print, we use 300 dpi
    const targetDPI: number = 300;

    /*
     * TODO: Figure out, how to obtain the desired format of the print before
     * printing. In the current implementation, I assume that we print to a
     * DIN A4 Paper, which has a diagonal size of 14.17 inches.
    */
    const dinA4DiagonalSizeInch: number = 14.17;
    const pixelRatio: number = this._calculatePixelRatioForDPI(svgWidth, svgHeight, targetDPI, dinA4DiagonalSizeInch);

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

    // get image as base64 datastring
    const image: string = canvas.toDataURL(encoding);
    return image;
  }

      /**
   * Calculate the pixel ratio for the given DPI.
   * The Pixel Ratio is the factor which is needed, to extend the
   * the width and height of a canvas to match a rendered resolution
   * with the targeting DPI.
   *
   * @param svgWidth With of the diagrams canvas element.
   * @param svgHeight Height of the diagrams canvas element.
   * @param targetDPI DPI of the output.
   * @param diagonalSize Diagonal Size of the printed document.
   */
  private _calculatePixelRatioForDPI(svgWidth: number, svgHeight: number, targetDPI: number, diagonalSize: number): number {

    // tslint:disable:no-magic-numbers
    const svgWidthSquared: number = Math.pow(svgWidth, 2);
    const svgHeightSquared: number = Math.pow(svgHeight, 2);

    const diagonalResolution: number = Math.sqrt(svgWidthSquared + svgHeightSquared);

    const originalDPI: number = diagonalResolution / diagonalSize;
    const pixelRatio: number = targetDPI / originalDPI;

    return pixelRatio;
  }

}
