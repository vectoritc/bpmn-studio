import {IIdentity} from '@essential-projects/core_contracts';
import {IDiagram, ISolution} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';

export class SingleDiagramsSolutionExplorerService implements ISolutionExplorerService {

  private _proxied: ISolutionExplorerService;
  private _openedDiagrams: Array<IDiagram> = [];
  private _uriOfSingleDiagramService: string;
  private _nameOfSingleDiagramService: string;

  constructor(
    proxied: ISolutionExplorerService,
    uriOfSingleDiagramService: string,
    nameOfSingleDiagramService: string,
  ) {
    this._proxied = proxied;
    this._uriOfSingleDiagramService = uriOfSingleDiagramService;
    this._nameOfSingleDiagramService = nameOfSingleDiagramService;
  }

  public getOpenedDiagrams(): Array<IDiagram> {
    return this._openedDiagrams;
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

  public async openSingleDiagram(pathToDiagram: string, identity: IIdentity): Promise<IDiagram> {
    const diagram: IDiagram = await this._proxied.openSingleDiagram(pathToDiagram, identity);

    this._openedDiagrams.push(diagram);

    return diagram;
  }

  public closeSingleDiagram(diagram: IDiagram): Promise<void> {
    const index: number = this._openedDiagrams
      .findIndex((alreadyOpenedDiagram: IDiagram): boolean => {
        return alreadyOpenedDiagram.uri === diagram.uri;
    });

    this._openedDiagrams.splice(index, 1);

    return Promise.resolve();
  }

  public saveSingleDiagram(diagramToSave: IDiagram, identity: IIdentity, path?: string): Promise<IDiagram> {
    return this._proxied.saveSingleDiagram(diagramToSave, identity, path);
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
}
