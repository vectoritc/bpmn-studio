import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Redirect, Router} from 'aurelia-router';
import {ValidateEvent, ValidationController} from 'aurelia-validation';

import {IProcessDefEntity} from '@process-engine/process_engine_contracts';
import * as canvg from 'canvg-browser';
import * as download from 'downloadjs';
import * as print from 'print-js';
import * as beautify from 'xml-beautifier';

import {
  AuthenticationStateEvent,
  ICanvgOptions,
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
  // TODO: Explain when this is set and by whom.
  private _diagramIsInvalid: boolean = false;
  // Used to control the modal view; shows the modal view for pressing the play button.
  private _startButtonPressed: boolean = false;

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

      //  Button Subscriptions {{{ //
      this._eventAggregator.subscribe(environment.events.processDefDetail.saveDiagram, () => {
        this._saveDiagram()
          .catch((error: Error) => {
            this
              ._notificationService
              .showNotification(
                NotificationType.ERROR,
                `Error while saving the diagram: ${error.message}`
              );
          });
      }),
      //  Export Subscriptions {{{ //
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
      //  }}} Export Subscriptions //

      //  Start Button Subscription {{{ //
      this._eventAggregator.subscribe(environment.events.processDefDetail.startProcess, () => {
        this._startProcess();
      }),
      //  }}} Start Button Subscription //
      //  }}} Button Subscriptions //

      //  General Event Subscritions {{{ //
      this._eventAggregator.subscribe(environment.events.diagramChange, () => {
        this._diagramHasChanged = true;
      }),
      this._eventAggregator.subscribe(environment.events.processDefDetail.printDiagram, () => {
        this._printDiagram();
      }),
      //  }}} General Event Subscritions //
    ];

    this._eventAggregator.publish(environment.events.navBar.showTools, this.process);
    this._eventAggregator.publish(environment.events.statusBar.showXMLButton);
  }

  /**
   * We implement canDeactivate() for the Aurelia Router, because we want to
   * prevent the user from leaving the editor, if there are changes, that need
   * to be saved.
   *
   * Basically, the Router will look for an implementation and execute this
   * method. The Aurelia Router is not working properly at this moment, so we use a workaround to achieve this:
   *
   * We return a Promise with a redirection to the previous view!
   * This will preserve the state and works as expected.
   *
   */
  public async canDeactivate(): Promise<Redirect> {

    const _modal: Promise<boolean> = new Promise((resolve: Function, reject: Function): any => {

      if (!this._diagramHasChanged) {
        resolve(true);

      } else {

        const modal: HTMLElement = this._startButtonPressed
          ? document.getElementById('saveModalProcessStart')
          : document.getElementById('saveModalLeaveView');

        modal.classList.add('show-modal');

        //  register onClick handler {{{ //
        /* Do not save and leave */
        const dontSaveButtonId: string = 'dontSaveButtonLeaveView';
        document
          .getElementById(dontSaveButtonId)
          .addEventListener('click', () => {

            modal.classList.remove('show-modal');

            this._diagramHasChanged = false;

            resolve(true);
          });

        /* Save and leave */
        const saveButtonId: string = this._startButtonPressed
          ? 'saveButtonProcessStart'
          : 'saveButtonLeaveView';

        document
          .getElementById(saveButtonId)
          .addEventListener('click', () => {

            this
              ._saveDiagram()
              .catch((error: Error) => {
                this._notificationService.showNotification(NotificationType.ERROR, `Unable to save the diagram: ${error.message}`);
              });

            modal.classList.remove('show-modal');

            this._diagramHasChanged = false;
            this._startButtonPressed = false;

            resolve(true);
          });

        /* Stay, do not save */
        const cancelButtonId: string = this._startButtonPressed
          ? 'cancelButtonProcessStart'
          : 'cancelButtonLeaveView';

        document
          .getElementById(cancelButtonId)
          .addEventListener('click', () => {
            modal.classList.remove('show-modal');

            this._startButtonPressed = false;

            resolve(false);
          });
        }
        //  }}} register onClick handler //
    });

    const result: boolean = await _modal;

    // TODO: Extract Business Rule
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
    return this
      ._processEngineService
      .getProcessDefById(this._processId)
      .then((result: any) => {
        // TODO: Extract Business Rule
        if (result && !result.error) {
          this.process = result;

          this
            ._eventAggregator
            .publish(environment.events.navBar.updateProcess, this.process);

          return this.process;

        } else {
          this.process = null;
          return result.error;
        }
    });
  }

  /**
   * This sets the _startButtonPressed flag to control the modal view of the save dialog.
   *
   * If the process is not valid, it will not start it.
   */
  private _startProcess(): void {
    this._validateXML();

    if (this._diagramIsInvalid) {
      this
        ._notificationService
        .showNotification(
          NotificationType.WARNING,
          'Unable to start the process, because it is not valid. This could have something to do with your latest changes. Try to undo them.'
        );
      return;
    }

    this._startButtonPressed = true;

    this._router.navigate(`processdef/${this.process.id}/start`);
  }

  /**
   * Currently unused Method.
   *
   * TODO: Look deeper into this if we need this method anymore and/or in this
   * particular way.
   *
   * TODO: Use this again.
   */
  private _deleteProcess(): void {
    const userIsSureOfDeletion: boolean = confirm('Are you sure you want to delete the process definition?');

    if (userIsSureOfDeletion) {
      this
        ._processEngineService
        .deleteProcessDef(this.process.id)
        .then(() => {
          this.process = null;
          this._router.navigate('');
        })
        .catch((error: Error) => {
          this._notificationService.showNotification(NotificationType.ERROR, error.message);
        });
    }
  }

  // TODO: Add Documentation.
  private async _saveDiagram(): Promise<void> {

    // TODO: This needs to be refactored; _validateXML() does not seem to work properly.
    this._validateXML();

    if (this._diagramIsInvalid) {
      this
        ._notificationService
        .showNotification(
          NotificationType.WARNING,
          'Unable to save the diagram, because it is not valid. This could have something to do with your latest changes. Try to undo them.'
        );
    }

    //  Save the diagram to the ProcessEngine {{{ //
    // TODO: Explain what this is doing -> Refactor.
    let response: any;

    try {
      const xml: string = await this.bpmnio.getXML();
      response = await this._processEngineService.updateProcessDef(this.process, xml);
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, `Somethig happend: ${error.message}`);
    }
    //  }}} Save the diagram to the ProcessEngine //

    // Treat possible errors {{{ //
    if (response.error) {
      this
        ._notificationService
        .showNotification(NotificationType.ERROR, `Unable to save the file: ${response.error}`);

    } else if (response.result) {
      this
        ._notificationService
        .showNotification(NotificationType.SUCCESS, 'File saved.');

    } else {
      // TODO: Not gonna buy this. Is this needed at all?
      this
        ._notificationService
        .showNotification(
          NotificationType.WARNING,
          `Something is very wrong: ${JSON.stringify(response)}. Please contact the BPMN-Studio team, they can help.`
        );
    }
    //  }}}  Treat possible errors //

    this._diagramHasChanged = false;
  }

  /**
   * In the current implementation this method only checks for UserTasks that have
   * empty or otherwise not allowed FormData in them.
   *
   * If that is the case the method will continue by deleting unused/not allowed
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

    download(formattedXml, `${this.process.name}.bpmn`, 'application/bpmn20-xml');
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

  /**
   * This heavily relies on the resolution of the screen.
   *
   * The result should be a pretty diagram for a printer;
   * the generated image will be obtain from the BPMN.io canvas,
   * that is dependent on the screen size.
   */
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

    // get image as base64 datastring
    const image: string = canvas.toDataURL(encoding);
    return image;
  }

  private _validateForm(event: ValidateEvent): void {
    const eventIsValidateEvent: boolean = event.type !== 'validate';

    if (eventIsValidateEvent) {
      return;
    }

    for (const result of event.results) {
      const resultIsNotValid: boolean = result.valid === false;

      if (resultIsNotValid) {
        this._eventAggregator.publish(environment.events.navBar.disableSaveButton);
        this._diagramIsInvalid = true;
        return;
      }
    }

    this._eventAggregator.publish(environment.events.navBar.enableSaveButton);
    this._diagramIsInvalid = false;
  }
}
