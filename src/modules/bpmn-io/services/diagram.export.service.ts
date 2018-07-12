import {IDiagramExportRepositoryContracts, IDiagramExportService} from '../../../contracts/index';
import {DiagramExportRepository} from '../repositories/DiagramExportRepository';

import * as beautify from 'xml-beautifier';

export class DiagramExportService implements IDiagramExportService {

  /**
   * Contains the queued function which are appended by chained calls.
   * This is necessary to keep track of the order, in which the async export
   * methods should be executed.
   */
  private _queuedExportMethods: Array<Function> = [];

  /**
   * Represents the current state of the services instance.
   */
  private _currentState: string;

  /**
   * Saves the current mime type.
   */
  private _currentMimeType: string;

  private _exportDiagramRepository: IDiagramExportRepositoryContracts;

  constructor(initialState?: string) {
    this._currentState = initialState;
    this._exportDiagramRepository = new DiagramExportRepository();
  }

  public async export(filename: string): Promise<void> {
    /*
     * Wait, until all queued functions are executed
     */
    for (const currentExporter of this._queuedExportMethods) {
      await currentExporter();
    }

    /*
     * If all exporters are finished, save the diagram to disk using the
     * defined export repository.
     */
    this._exportDiagramRepository.exportDiagram(this._currentState, filename, this._currentMimeType);

    /*
     * After exporting, we can reset the queued promises.
     */
    this._queuedExportMethods = [];

  }

  /**
   * Updates the current state to the given xml.
   *
   * TODO: Maybe we can do some kind of validation here to make sure, that the
   * user who use this service really pass a valid xml here.
   *
   * @param xmlContent updated xml file.
   */
  public loadXML(xmlContent: string): IDiagramExportService {
    this._currentState = xmlContent;
    return this;
  }

  /**
   * Updates the current state to the given svg.
   *
   * TODO: Maybe we can do some kind of validation here to make sure, that the
   * user who use this service really pass a valid svg here.
   *
   * @param svgContent updated svg file.
   */
  public loadSVG(svgContent: string): IDiagramExportService {
    this._currentState = svgContent;
    return this;
  }

  public asBpmn(): IDiagramExportService {
    const currentStateIsNotSet: boolean = (this._currentState === undefined || this._currentState === null);
    if (currentStateIsNotSet) {
      throw new Error('No XML file to export loaded');
    }

    this._queuedExportMethods.push(this._bpmnExporter);
    this._currentMimeType = 'application/bpmn20-xml';
    return this;
  }

  public asSVG(): IDiagramExportService {
    const currentStateIsNotSet: boolean = (this._currentState === undefined || this._currentState === null);
    if (currentStateIsNotSet) {
      throw new Error('No SVG file to export loaded');
    }

    // this._queuedExportMethods.push(this._svgExporter);
    this._currentMimeType = 'image/svg+xml';
    return this;
  }

  public asPNG(): IDiagramExportService {
    const currentStateIsNotSet: boolean = (this._currentState === undefined || this._currentState === null);
    if (currentStateIsNotSet) {
      throw new Error('No SVG file to convert and exporting defined.');
    }

    this._queuedExportMethods.push(this._pngExporter);
    this._currentMimeType = 'image/png';
    return this;
  }

  public asJPEG(): IDiagramExportService {
    const currentStateIsNotSet: boolean = (this._currentState === undefined || this._currentState === null);
    if (currentStateIsNotSet) {
      throw new Error('No SVG file to convert and exporting defined.');
    }

    this._queuedExportMethods.push(this._jpegExporter);
    this._currentMimeType = 'image/jpeg';
    return this;
  }

  /**
   * Formats the current loaded xml.
   */
  private _bpmnExporter = async(): Promise<void> => {
    const formattedXml: string = beautify(this._currentState);
    this._currentState = formattedXml;
  }

  /**
   * Prepares the current loaded SVG for exporting.
   *
   * TODO: Discuss the purpose of this method.
   */
  /*private _svgExporter = async(): Promise<void> => {
    const svgNotDefined: boolean = (this._currentState === undefined || this._currentState# === null);
    if (svgNotDefined) {
      throw new Error('No SVG for exporting defined');
    }
  }*/

  /**
   * Exports the current diagram as a PNG image.
   */
  private _pngExporter = async(): Promise<void> => {
    this._currentState =  await this._generateImageFromSVG('png', this._currentState);
  }

  /**
   * Exports the current diagram as a jpeg image.
   */
  private _jpegExporter = async(): Promise<void> => {
    this._currentState = await this._generateImageFromSVG('png', this._currentState);
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
