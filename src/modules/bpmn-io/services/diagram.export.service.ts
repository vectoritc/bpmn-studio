import * as download from 'downloadjs';
import * as beautify from 'xml-beautifier';
import {IBpmnModeler, IProcessDefEntity} from '../../../contracts';

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

  private async _generateImageFromSVG(desiredImageType: string, svg: string): Promise<string> {
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

    // make the background white for every format
    context.globalCompositeOperation = 'destination-over';
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // get image as base64 datastring
    const imageDataURL: string = await this._drawSVGToCanvas(svg, canvas, context, encoding);

    return imageDataURL;
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

    /**
   * Draws a given SVG image to a Canvas and converts it to an image.
   *
   * @param svgContent SVG Content that should be drawn to the image.
   * @param canvas Canvas, in which the SVG image should be drawn.
   * @param context Context of the Canvas.
   * @param encoding Encoding of the output image.
   * @returns The URL which points to the rendered image.
   */
  private async _drawSVGToCanvas(
    svgContent: string,
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    encoding: string): Promise<string> {

    const imageElement: HTMLImageElement = document.createElement('img');

    /*
    * This makes sure, that the base64 encoded SVG does not contain any
    * escaped html characters (such as &lt; instead of <).
    *
    * TODO: The unescape Method is marked as deprecated.
    * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/unescape
    *
    * The problem is, that the replacement method decodeURI does not work in this case
    * (it behaves kinda different in some situations).
    * Event the MDN use the unescape method to solve this kind of problem:
    * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa#Unicode_strings
    *
    * There is an npm packet that implements the original unescape function.
    * Maybe we can use this to make sure that this won't cause any
    * problems in the future.
    */
    const encodedSVG: string = btoa(unescape(encodeURIComponent(svgContent)));
    imageElement.setAttribute('src', `data:image/svg+xml;base64, ${encodedSVG}`);

    const loadImagePromise: Promise<string> = new Promise((resolve: Function, reject: Function): void => {
      imageElement.onload = (): void => {
        context.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
        const encodedImageURL: string = canvas.toDataURL(encoding);
        resolve(encodedImageURL);
      };

      imageElement.onerror = (errorEvent: ErrorEvent): void => {
        /*
        * TODO: Find out if we can reject the promise with a more specify
        * error here.
        */
        reject(errorEvent);
      };
    });

    return loadImagePromise;
  }

}
