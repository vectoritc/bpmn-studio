import {IDiagram} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';

export class DeleteDiagramModal {
  public showModal: boolean = false;

  private _diagram: IDiagram;
  private _service: ISolutionExplorerService;

  public show(diagram: IDiagram, solutionService: ISolutionExplorerService): void {
    this._diagram = diagram;
    this._service = solutionService;

    this.showModal = true;
  }

  public closeModal(): void {
    this._diagram = undefined;
    this._service = undefined;

    this.showModal = false;
  }

  public async deleteDiagram(): Promise<void> {
    await this._service.deleteDiagram(this._diagram);

    this.showModal = false;
  }
}
