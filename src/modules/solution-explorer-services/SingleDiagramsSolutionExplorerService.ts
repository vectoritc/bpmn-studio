import {IIdentity} from '@essential-projects/iam_contracts';
import {IDiagram, ISolution} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';

import {IDiagramValidationService} from '../../contracts';

/**
 * This service allows to keep all opened single diagrams inside a solution.
 *
 * This is needed because the default solution explorer does not keep state
 * about single diagrams.
 *
 * With this service you can retrieve, all opened single diagrams inside a
 * solution.
 *
 * To remove a diagram from the solution, call use #closeSingleDiagram().
 */
export class SingleDiagramsSolutionExplorerService implements ISolutionExplorerService {

  private _validationService: IDiagramValidationService;
  private _solutionExplorerToOpenDiagrams: ISolutionExplorerService;
  private _uriOfSingleDiagramService: string;
  private _nameOfSingleDiagramService: string;
  private _openedDiagrams: Array<IDiagram> = [];

  constructor(
    validationService: IDiagramValidationService,
    solutionExplorerToOpenDiagrams: ISolutionExplorerService,
    uriOfSingleDiagramService: string,
    nameOfSingleDiagramService: string,
  ) {
    this._validationService = validationService;
    this._solutionExplorerToOpenDiagrams = solutionExplorerToOpenDiagrams;
    this._uriOfSingleDiagramService = uriOfSingleDiagramService;
    this._nameOfSingleDiagramService = nameOfSingleDiagramService;
  }

  public getOpenedDiagrams(): Array<IDiagram> {
    return this._openedDiagrams;
  }

  /**
   * Gets the single diagram with the given uri, if the diagram was opened
   * before.
   */
  public getOpenedDiagramByURI(uri: string): IDiagram | null {
    const indexOfDiagram: number = this._findOfDiagramWithURI(uri);

    const diagramWasNotFound: boolean = indexOfDiagram < 0;
    if (diagramWasNotFound) {
      return null;
    }

    const diagramWithURI: IDiagram = this._openedDiagrams[indexOfDiagram];

    return diagramWithURI;
  }

  public openSolution(pathspec: string, identity: IIdentity): Promise<void> {
    return Promise.resolve();
  }

  public loadSolution(): Promise<ISolution> {
    const solution: ISolution = {
      diagrams: this._openedDiagrams,
      name: this._uriOfSingleDiagramService,
      uri: this._nameOfSingleDiagramService,
    };
    return Promise.resolve(solution);
  }

  public async openSingleDiagram(uri: string, identity: IIdentity): Promise<IDiagram> {
    const uriAlreadyOpened: boolean = this._findOfDiagramWithURI(uri) >= 0;

    if (uriAlreadyOpened) {
      throw new Error('This diagram is already opened.');
    }

    const diagram: IDiagram = await this._solutionExplorerToOpenDiagrams
      .openSingleDiagram(uri, identity);

    await this._validationService
      .validate(diagram.xml)
      .isXML()
      .isBPMN()
      .throwIfError();

    this._openedDiagrams.push(diagram);

    return diagram;
  }

  public closeSingleDiagram(diagram: IDiagram): Promise<void> {
    const index: number = this._findOfDiagramWithURI(diagram.uri);

    this._openedDiagrams.splice(index, 1);

    return Promise.resolve();
  }

  public saveSingleDiagram(diagramToSave: IDiagram, identity: IIdentity, path?: string): Promise<IDiagram> {
    return this._solutionExplorerToOpenDiagrams
      .saveSingleDiagram(diagramToSave, identity, path);
  }

  public loadDiagram(diagramName: string): Promise<IDiagram> {
    throw new Error('Method not supported.');
  }

  public saveSolution(solution: ISolution, pathspec?: string): Promise<void> {
    throw new Error('Method not supported.');
  }

  public saveDiagram(diagram: IDiagram): Promise<void> {
    throw new Error('Method not supported.');
  }

  private _findOfDiagramWithURI(uri: string): number {
    const index: number = this._openedDiagrams
      .findIndex((diagram: IDiagram): boolean => {
        return diagram.uri === uri;
    });

    return index;
  }
}
