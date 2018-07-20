import {IExportService} from '../../../contracts/index';
import {DiagramExportRepository} from '../repositories/DiagramExportRepository';

export class ExportService implements IExportService {
  private _enqueuedPromises: Array<Promise<string>>;
  private _exportDiagramRepository: DiagramExportRepository;
  private _currentMimeType: string;

  constructor(currentMimeType: string, enqueuedPromises: Array<Promise<string>>) {
    this._currentMimeType = currentMimeType;
    this._enqueuedPromises = enqueuedPromises;
    this._exportDiagramRepository = new DiagramExportRepository();
  }

  public async export(filename: string): Promise<void> {

    let contentToExport: string;

    /*
     * Wait, until all queued functions are executed
     */
    for (const currentPromise of this._enqueuedPromises) {
      /*
       * TODO: We are only interested on the last resolved promise
       * here. Find out, how to obtain the last resolved promise and remove
       * the unnecessary assignments.
       */
      contentToExport = await currentPromise;
    }

    /*
     * If all exporters are finished, save the diagram to disk using the
     * defined export repository.
     */
    this._exportDiagramRepository.exportDiagram(contentToExport, filename, this._currentMimeType);

    /*
     * After exporting, we can reset the queued promises.
     */
    this._enqueuedPromises = [];
  }
}
