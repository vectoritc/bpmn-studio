import * as download from 'downloadjs';
import * as beautify from 'xml-beautifier';

import {
  IBpmnModeler,
  IDiagramExportService,
  IProcessDefEntity,
} from '../../../contracts';

export class DiagramExportService implements IDiagramExportService {

  /**
   * Exports the current diagram as a *.bpmn xml file.
   */
  public async exportBPMN(xml: string): Promise<string> {
    const formattedXml: string = beautify(xml);
    return formattedXml;
  }

  /**
   * Exports the current Diagram as a SVG file and prompts the user to save
   * the exported file.
   *
   * TODO: This method is currently completely pointless. In a new PR, this
   * will have the ability, to either return the svg delivered in the parameter
   * or from the instance.
   */
  public async exportSVG(svg: string): Promise<string> {
    return svg;
  }

  /**
   * Exports the current Diagram as a PNG image and prompts the user to save
   * the exported file.
   */
  public async exportPNG(svg: string): Promise<string> {
    const svgToConvert: string = svg;

    const imageURL: string = await this._generateImageFromSVG('png', svgToConvert);
    return imageURL;
  }

  /**
   * Exports the current Diagram as a JPEG image and prompts the user to save
   * the exported file.
   */
  public async exportJPEG(svg: string): Promise<string> {

    const svgToConvert: string = svg;

    const imageURL: string = await this._generateImageFromSVG('jpeg', svgToConvert);
    return imageURL;
  }

  /**
   * Converts the given xml into an image. The returning value is a DataURL that
   * points to the created image.
   *
   * @param desiredImageType Output type of the image.
   * @param svg SVG that should be converted into an image with the desired format.
   * @returns A DataURL that points to the created image.
   */
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

    // Make the background white for every format
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the image to the canvas
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
   * @returns The needed pixel ratio for the current dimensions to achieve the
   * desired DPI.
   */
  private _calculatePixelRatioForDPI(svgWidth: number, svgHeight: number, targetDPI: number, diagonalSize: number): number {

    const square: Function = (num: number): number => num * num;

    const svgWidthSquared: number = square(svgWidth);
    const svgHeightSquared: number = square(svgHeight);

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
        * TODO: Find out if we can reject the promise with a more specific
        * error here.
        */
        reject(errorEvent);
      };
    });

    return loadImagePromise;
  }

}
