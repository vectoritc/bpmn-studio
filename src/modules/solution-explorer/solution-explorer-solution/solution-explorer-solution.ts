import {IDiagram, ISolution} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';
import {EventAggregator} from 'aurelia-event-aggregator';
import {bindable, computedFrom, inject, NewInstance} from 'aurelia-framework';
import {PipelineResult, Router} from 'aurelia-router';
import { FluentRuleCustomizer, ValidateEvent, ValidateResult, ValidationController, ValidationRules } from 'aurelia-validation';
import { IDiagramCreationService } from '../../../contracts';
import environment from '../../../environment';
import { DiagramCreationService } from '../../diagram-creation-service/DiagramCreationService';
import { SingleDiagramsSolutionExplorerService } from '../../solution-explorer-services/SingleDiagramsSolutionExplorerService';

const ENTER_KEY: string = 'Enter';
const ESCAPE_KEY: string = 'Escape';

interface DiagramCreationState {
  isCreateDiagramInputShown: boolean;
  documentEventHandlers: Map<string, (event: any) => void>;
  currentDiagramInputValue: string;
  errors: Array<ValidateResult>;
}

@inject(Router, EventAggregator, NewInstance.of(ValidationController)) // , 'DiagramCreationService')
export class SolutionExplorerSolution {

  private _router: Router;
  private _eventAggregator: EventAggregator;
  private _validationController: ValidationController;
  private _diagramCreationService: IDiagramCreationService;

  @bindable
  public solutionService: ISolutionExplorerService;
  @bindable
  public solutionIsSingleDiagrams: boolean;
  public createNewDiagramInput: HTMLInputElement;

  private _openedSolution: ISolution;
  private _diagramCreationState: DiagramCreationState = {
    currentDiagramInputValue: undefined,
    documentEventHandlers: new Map(),
    errors: undefined,
    isCreateDiagramInputShown: false,
  };

  private _newDiagramNameValidator: FluentRuleCustomizer<DiagramCreationState, DiagramCreationState> = ValidationRules
      .ensure((state: DiagramCreationState) => state.currentDiagramInputValue)
      .displayName('Diagram name')
      .required()
      .withMessage('Diagram name cannot be blank.')
      .then()
      .satisfies((input: string, solution: DiagramCreationState) => {

        // TODO FIX: solution arg??
        const diagramUri: string = `${this._openedSolution.uri}/${input}.bpmn`;

        const diagramWithIdDoesNotExists: boolean = this.
          _findURIObject(this._openedSolution.diagrams, diagramUri) === undefined;

        return diagramWithIdDoesNotExists;
      })
      .withMessage('A diagram with that name already exists.');

  constructor(
    router: Router,
    eventAggregator: EventAggregator,
    validationController: ValidationController,
    diagramCreationService: IDiagramCreationService,
  ) {
    this._router = router;
    this._eventAggregator = eventAggregator;
    this._validationController = validationController;
    this._diagramCreationService = new DiagramCreationService(); // TODO IoC

    // TODO (ph): Move this into attached / detached.
    setInterval(async() =>  {
      // this.updateSolution();
    }, 1000); // TODO config
  }

  public async solutionServiceChanged(newValue: ISolutionExplorerService, oldValue: ISolutionExplorerService): Promise<void> {
    this.updateSolution();
  }

  public async updateSolution(): Promise<void> {
    const solution: ISolution = await this.solutionService.loadSolution();

    this._openedSolution = solution;
  }

  public async closeDiagram(diagram: IDiagram): Promise<void> {
    const singleDiagramService: SingleDiagramsSolutionExplorerService = this.solutionService as SingleDiagramsSolutionExplorerService;

    singleDiagramService.closeSingleDiagram(diagram);
  }

  public async startCreationOfNewDiagram(): Promise<void> {
    if (this._diagramCreationState.isCreateDiagramInputShown) {
      return;
    }

    this._diagramCreationState.isCreateDiagramInputShown = true;

    this._newDiagramNameValidator.on(this._diagramCreationState);

    this._validationController.subscribe((event: ValidateEvent) => {
      this._diagramCreationState.errors = event.errors;
    });

    window.setTimeout(() => {
      this.createNewDiagramInput.focus();
    }, 0);

    const clickEventHandler: (event: MouseEvent) => void = (event: MouseEvent): void => {
      this._onCreateNewDiagramClickEvent(event);
    };
    const keyEventHandler: (event: KeyboardEvent) => void = (event: KeyboardEvent): void => {
      this._onCreateNewDiagramKeyupEvent(event);
    };

    this._diagramCreationState.documentEventHandlers.set('click', clickEventHandler);
    this._diagramCreationState.documentEventHandlers.set('keyup', keyEventHandler);

    document.addEventListener('click', clickEventHandler);
    document.addEventListener('keyup', keyEventHandler);
  }

  public isCreateDiagramInputShown(): boolean {
    return this._diagramCreationState.isCreateDiagramInputShown;
  }

  private async _onCreateNewDiagramClickEvent(event: MouseEvent): Promise<void> {

    const inputWasClicked: boolean = event.target === this.createNewDiagramInput;
    if (inputWasClicked) {
      return;
    }

    const emptyDiagram: IDiagram = await this._createNewDiagram();
    if (emptyDiagram === undefined) {
      return;
    }

    this.updateSolution();
    this._resetDiagramCreation();
    this.navigateToDetailView(emptyDiagram);
  }

  private async _onCreateNewDiagramKeyupEvent(event: KeyboardEvent): Promise<void> {

    const pressedKey: string = event.key;

    if (pressedKey === ENTER_KEY) {

      const emptyDiagram: IDiagram = await this._createNewDiagram();
      if (emptyDiagram === undefined) {
        return;
      }

      this.updateSolution();
      this._resetDiagramCreation();
      this.navigateToDetailView(emptyDiagram);

    } else if (pressedKey === ESCAPE_KEY) {
      this._resetDiagramCreation();
    }
  }

  private _hasNonEmptyValue(input: HTMLInputElement): boolean {
    const inputValue: string = input.value;

    const inputHasValue: boolean = inputValue !== undefined
                                && inputValue !== null
                                && inputValue !== '';

    return inputHasValue;
  }

  private async _createNewDiagram(): Promise<IDiagram> {
    const inputHasNoValue: boolean = !this._hasNonEmptyValue(this.createNewDiagramInput);
    if (inputHasNoValue) {
      this._resetDiagramCreation();

      return;
    }

    const processName: string = this._diagramCreationState.currentDiagramInputValue.trim();

    const processNameIsEmpty: boolean = processName.length === 0;
    if (processNameIsEmpty) {
      // TODO(ph)
      // this._notificationService.showNotification(NotificationType.INFO, 'Process Model name must not be empty.');
      alert('Process Model name must not be empty.');
      return;
    }

    const diagramUri: string = `${this._openedSolution.uri}/${processName}.bpmn`;

    const foundDiagram: IDiagram = this
      ._findURIObject(this._openedSolution.diagrams, diagramUri);

    const diagramWithIdAlreadyExists: boolean = foundDiagram !== undefined;
    if (diagramWithIdAlreadyExists) {
      const infoMessage: string = 'A diagram with that name already exists, creating aborted. Please specify a different name.';
      // TODO(ph)
      // this._notificationService.showNotification(NotificationType.INFO, infoMessage);
      alert(infoMessage);
      return;
    }

    // const processNameAsCharArray: Array<string> = processName.split('');

    // const containsInvalidCharacter: boolean = processNameAsCharArray.some((letter: string) => {
    //   for (const regExIndex in this._diagramValidationRuleset) {
    //     if (letter.match(this._diagramValidationRuleset[regExIndex]) !== null) {
    //       return false;
    //     }
    //   }

    //   return true;
    // });

    // if (containsInvalidCharacter) {
    //   const documentationLink: string = 'https://www.process-engine.io/documentation/bpmn-studio/'
    //                                   + 'components/solution-explorer/solution-explorer.html#valide-diagramm-namen';

    //   const infoMessage: string = 'The diagram name contains invalid characters. Please correct the name and try again.'
    //                             + ` <a href="javascript:nodeRequire('open')`
    //                             + `('${documentationLink}')">`
    //                             +  'Click here to see which letters are valid.'
    //                             +  '</a>';
    //   this._notificationService.showNotification(NotificationType.INFO, infoMessage);

    //   return;
    // }

    const emptyDiagram: IDiagram = this._diagramCreationService
      .createNewDiagram(this._openedSolution.uri, this._diagramCreationState.currentDiagramInputValue);

    try {
      // TODO: uri is kinda useless, cause the diagram contains its uri... but we fix this later.
      await this.solutionService.saveDiagram(emptyDiagram, emptyDiagram.uri);
    } catch (error) {
      // this._notificationService.showNotification(NotificationType.ERROR, error.message);
      alert(error.message);
      return;
    }

    return emptyDiagram;
  }

  private _resetDiagramCreation(): void {
    // Remove all used event listeners.
    this._diagramCreationState.documentEventHandlers.forEach((eventHandler: (event: any) => any, eventName: string): void => {
      document.removeEventListener(eventName, eventHandler);
    });
    this._diagramCreationState.documentEventHandlers = new Map();

    // Reset input field.
    this._diagramCreationState.currentDiagramInputValue = '';
    this.createNewDiagramInput.value = '';
    // Hide input field.
    this._diagramCreationState.isCreateDiagramInputShown = false;

    ValidationRules.off(this._diagramCreationState);
  }

  public shouldFileIconBeShown(): boolean {
    return false;
  }

  public canRenameDiagram(): boolean {
    return false;
  }

  public canDeleteDiagram(): boolean {
    return false;
  }

  public get solutionIsNotLoaded(): boolean {
    return this._openedSolution === null || this._openedSolution === undefined;
  }

  public get openedDiagrams(): Array<IDiagram> {
    if (this._openedSolution) {
      return this._openedSolution.diagrams;
    } else {
      return [];
    }
  }

  public async navigateToDetailView(diagram: IDiagram): Promise<void> {
    // TODO: Remove this if cause if we again have one detail view.
    const diagramIsOpenedFromRemote: boolean = diagram.uri.startsWith('http');

    if (diagramIsOpenedFromRemote) {
      await this._router.navigateToRoute('processdef-detail', {
        processModelId: diagram.id,
      });

    } else {

      const navigationResult: boolean = await this._router.navigateToRoute('diagram-detail', {
        diagramUri: diagram.uri,
      });

      // This is needed, because navigateToRoute returns an object even though a boolean should be returned
      const navigationSuccessful: boolean = (typeof(navigationResult) === 'boolean')
        ? navigationResult
        : (navigationResult as PipelineResult).completed;

      if (navigationSuccessful) {
        this._eventAggregator.publish(environment.events.navBar.updateProcess, diagram);
      }
    }

  }

  private _findURIObject<T extends {uri: string}>(objects: Array<T> , targetURI: string): T {
    const foundObject: T = objects.find((object: T): boolean => {
      return object.uri.toLowerCase() === targetURI.toLowerCase();
    });

    return foundObject;
  }

}
