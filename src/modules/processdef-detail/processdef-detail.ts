import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Redirect, Router} from 'aurelia-router';
import {ValidateEvent, ValidationController} from 'aurelia-validation';

import {
  Event,
  EventList,
  IManagementApiService,
  ManagementContext,
  ProcessModelExecution,
} from '@process-engine/management_api_contracts';

import {
  AuthenticationStateEvent,
  IAuthenticationService,
  IExtensionElement,
  IFormElement,
  IModdleElement,
  IShape,
  NotificationType,
} from '../../contracts/index';
import environment from '../../environment';
import {BpmnIo} from '../bpmn-io/bpmn-io';
import {NotificationService} from '../notification/notification.service';

interface RouteParameters {
  processId: string;
}

@inject(
  EventAggregator,
  Router,
  ValidationController,
  'NotificationService',
  'NewAuthenticationService',
  'ManagementApiClientService')
export class ProcessDefDetail {

  public bpmnio: BpmnIo;
  public process: ProcessModelExecution.ProcessModel;
  public showModal: boolean = false;

  public processesStartEvents: Array<Event> = [];
  // TODO: Explain what dropdown this is and find a better name.
  public dropdownMenu: HTMLSelectElement;

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
  private _authenticationService: IAuthenticationService;
  private _managementApiClient: IManagementApiService;

  constructor(eventAggregator: EventAggregator,
              router: Router,
              validationController: ValidationController,
              notificationService: NotificationService,
              authenticationService: IAuthenticationService,
              managementApiClient: IManagementApiService) {

    this._eventAggregator = eventAggregator;
    this._router = router;
    this._validationController = validationController;
    this._notificationService = notificationService;
    this._authenticationService = authenticationService;
    this._managementApiClient = managementApiClient;
  }

  public async activate(routeParameters: RouteParameters): Promise<void> {
    this._processId = routeParameters.processId;
    this._diagramHasChanged = false;
    await this._refreshProcess();
  }

  public attached(): void {
    this._subscriptions = [
      //#region Aurelia Event Subscriptions
      // Aurelia will expose the ValidateEvent, we use this to check the BPMN in the modeler.
      this._validationController.subscribe((event: ValidateEvent) => {
        this._handleFormValidateEvents(event);
      }),

      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this._refreshProcess();
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this._refreshProcess();
      }),
      //#endregion

      //#region Button Subscriptions

      //#region Save Button Subscription
      this._eventAggregator.subscribe(environment.events.processDefDetail.saveDiagram, () => {
        this._saveDiagram()
          .catch((error: Error) => {
            this
              ._notificationService
              .showNotification(NotificationType.ERROR, `Error while saving the diagram: ${error.message}`);
          });
      }),
      //#endregion

      //#region Start Button Subscription
      this._eventAggregator.subscribe(environment.events.processDefDetail.startProcess, () => {
        this._startProcess();
      }),
      //#endregion

      //#endregion

      //#region General Event Subscritions
      this._eventAggregator.subscribe(environment.events.diagramChange, () => {
        this._diagramHasChanged = true;
      }),
      //#endregion

    ];

    this._eventAggregator.publish(environment.events.navBar.showTools, this.process);
    this._eventAggregator.publish(environment.events.navBar.showStartButton);
    this._eventAggregator.publish(environment.events.statusBar.showDiagramViewButtons);
  }

  public determineActivationStrategy(): string {
    return 'replace';
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

    const _modal: Promise<boolean> = new Promise((resolve: Function, reject: Function): void => {

      if (!this._diagramHasChanged) {
        resolve(true);

      } else {

        const modal: HTMLElement = this._startButtonPressed
          ? document.getElementById('saveModalProcessStart')
          : document.getElementById('saveModalLeaveView');

        modal.classList.add('show-modal');

        //#region register onClick handler
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
        //#endregion
    });

    const result: boolean = await _modal;

    // TODO: Extract Business Rule
    if (result === false) {
      /*
       * As suggested in https://github.com/aurelia/router/issues/302, we use
       * the router directly to navigate back, which results in staying on this
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
    this._eventAggregator.publish(environment.events.navBar.hideStartButton);
    this._eventAggregator.publish(environment.events.statusBar.hideDiagramViewButtons);
  }

  /**
   * Opens a modal dialog to ask the user, which StartEvent he want's to
   * use to start the process.
   *
   * @returns A promise which resolves, if the user confirms his answer. The
   * promise is either resolved with the id of the selected StartEvent or with an
   * empty string, if the user dismissed this modal dialog.
   */
  public async showModalDialogAndAwaitAnswer(): Promise<string> {
    this.showModal = true;

    /*
     * TODO: Find out if the call here is necessary. The only place where this
     * the showModalDialogAndAwaitAnswer method is needed, is in startProcess,
     * which updates the current start events before even calling this method
     * anyways.
     */
    try {
      await this._initializeModalDialog();
    } catch (error) {
      return;
    }

    /*
     * Create a promise which displays the modal and resolves, if the user
     * clicks on the buttons.
     */
    const returnPromise: Promise<string | null> = new Promise((resolve: Function, reject: Function): void => {
      const cancelButton: HTMLElement = document.getElementById('cancelStartEventSelection');
      const startProcessButton: HTMLElement = document.getElementById('startProcessWithSelectedStartEvent');

      cancelButton.addEventListener('click', () => {
        this.showModal = false;
        resolve(null);
      });

      startProcessButton.addEventListener('click', () => {
        this.showModal = false;
        resolve(this.dropdownMenu.value);
      });
    });

    return returnPromise;
  }

  private async _refreshProcess(): Promise<ProcessModelExecution.ProcessModel> {
    const context: ManagementContext = this._getManagementContext();

    const updatedProcessModel: ProcessModelExecution.ProcessModel = await this._managementApiClient.getProcessModelById(context, this._processId);

    this.process = updatedProcessModel;
    this
      ._eventAggregator
      .publish(environment.events.navBar.updateProcess, this.process);

    return updatedProcessModel;
  }

  private async _initializeModalDialog(): Promise<void> {

    try {
      await this._updateProcessStartEvents();
    } catch (error) {
      this
        ._notificationService
        .showNotification(
          NotificationType.ERROR,
          `Error while obtaining the StartEvents which belongs to the Process: ${error.message}`,
        );
      throw error;
    }
  }

  /**
   * This sets the _startButtonPressed flag to control the modal view of the save dialog.
   *
   * If the process is not valid, it will not start it.
   */
  private async _startProcess(): Promise<void> {

    /*
    * TODO: Since the existence of the _initializeModal Method, a call
    * to _updateProcessStartEvents is redundant here. Since we need to refresh
    * the start events here to look, if we only have one or more start events,
    * I would suggest that we remove the _initializeModal method.
    */
    try {
      await this._updateProcessStartEvents();
    } catch (error) {
      this.
        _notificationService
        .showNotification(
          NotificationType.ERROR,
          `Could not load the processes StartEvents: ${error.message}`,
        );

        /*
         * When it is not possible to obtain the processes start events,
         * we can return.
         */
      return;
    }

    const selectedStartEvent: string | null = await this.showModalDialogAndAwaitAnswer();

    if (selectedStartEvent === null) {
      return;
    }

    this._dropInvalidFormData();

    if (this._diagramIsInvalid) {
      this
        ._notificationService
        .showNotification(
          NotificationType.WARNING,
          'Unable to start the process, because it is not valid. This could have something to do with your latest changes. Try to undo them.',
        );
      return;
    }

    this._startButtonPressed = true;

    const context: ManagementContext = this._getManagementContext();
    const startRequestPayload: ProcessModelExecution.ProcessStartRequestPayload = {
      inputValues: {},
    };

    try {
      const response: ProcessModelExecution.ProcessStartResponsePayload = await this._managementApiClient
        .startProcessInstance(context, this.process.id, selectedStartEvent, startRequestPayload, undefined, undefined);

      const correlationId: string = response.correlationId;

      // TODO (Stefffen): Change Route as needed.
      this._router.navigateToRoute('processdef-start', {
        correlationId: correlationId,
        processModelId: this.process.id,
      });
    } catch (error) {
      this.
        _notificationService
        .showNotification(
          NotificationType.ERROR,
          error.message,
        );
    }
  }

  private _getManagementContext(): ManagementContext {
    const accessToken: string = this._authenticationService.getAccessToken();
    const context: ManagementContext = {
      identity: accessToken,
    };

    return context;
  }

  private async _updateProcessStartEvents(): Promise<void> {
    const context: ManagementContext = this._getManagementContext();
    const startEventResponse: EventList = await this._managementApiClient.getEventsForProcessModel(context, this.process.id);

    this.processesStartEvents = startEventResponse.events;
  }

  /**
   * This method will save the diagram by using the ProcessEngineService.
   *
   * The user will be notified, about the outcome of the operation. Errors will be
   * reported reasonably and a success message will be emitted.
   *
   * Saving is not possible, if _diagramIsInvalid has been set to true.
   *
   * The source of the XML is the bmpn.io-modeler. It is used to extract the BPMN
   * while saving; a validation is not executed here.
   */
  private async _saveDiagram(): Promise<void> {

    this._dropInvalidFormData();

    if (this._diagramIsInvalid) {
      this
        ._notificationService
        .showNotification(
          NotificationType.WARNING,
          'Unable to save the diagram, because it is not valid. This could have something to do with your latest changes. Try to undo them.',
        );
      return;
    }

    //#region Save the diagram to the ProcessEngine

    try {
      const xml: string = await this.bpmnio.getXML();

      const context: ManagementContext = this._getManagementContext();

      const payload: ProcessModelExecution.UpdateProcessModelRequestPayload = {
        xml: xml,
      };

      await this._managementApiClient.updateProcessModelById(context, this.process.id, payload);
      this._notificationService.showNotification(NotificationType.SUCCESS, 'File saved.');
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, `Error while saving diagram: ${error.message}`);
    }
    //#endregion

    this._diagramHasChanged = false;
  }

  /**
   * In the current implementation this method only checks for UserTasks that have
   * empty or otherwise not allowed FormData in them.
   *
   * If that is the case the method will continue by deleting unused/not allowed
   * FormData to make sure the diagrams XML is further supported by Camunda.
   *
   * TODO: Look further into this if this method is not better placed at the FormsSection
   * in the Property Panel, also split this into two methods and name them right.
   */
  private _dropInvalidFormData(): void {
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

  /**
   * This handler will set the diagram state to invalid, if the ValidateEvent arrives.
   * Currently only form fields in the Property Panel are validated. This will cause
   * the following behaviour:
   *
   * The user inserts an invalid string (e.g. he uses a already used Id for an element);
   * The Aurelia validators will trigger; the validation event will arrive here;
   * if there are errors present, we will disable the save button and the save functionality
   * by setting the _diagramIsInvalid flag to true.
   *
   * Events fired here:
   *
   * 1. disableSaveButton
   * 2. enableSaveButton
   */
  private _handleFormValidateEvents(event: ValidateEvent): void {
    const eventIsValidateEvent: boolean = event.type !== 'validate';

    if (eventIsValidateEvent) {
      return;
    }

    for (const result of event.results) {
      const resultIsNotValid: boolean = result.valid === false;

      if (resultIsNotValid) {
        this._diagramIsInvalid = true;
        this._eventAggregator
          .publish(environment.events.navBar.disableSaveButton);

        return;
      }
    }

    this._eventAggregator
      .publish(environment.events.navBar.enableSaveButton);

    this._diagramIsInvalid = false;
  }
}
