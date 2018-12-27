import {IDiagram} from '@process-engine/solutionexplorer.contracts';

import {ISolutionEntry} from './ISolutionEntry';

export interface ISolutionService {
  /**
   * Adds a SolutionEntry to the service.
   * @param solutionEntry The SolutionEntry to add.
   */
  addSolutionEntry(solutionEntry: ISolutionEntry): void;

  /**
   * Gets a specific SolutionEntry identified by its URI.
   * @param uri The uri of the searched SolutionEntry.
   */
  getSolutionEntryForUri(uri: string): ISolutionEntry;

  /**
   * Gets a list of all persisted solutions from the last session.
   */
  getPersistedEntries(): Array<ISolutionEntry>;

  /**
   * Gets a list of all currently connected remote solutions.
   */
  getRemoteSolutionEntries(): Array<ISolutionEntry>;

  /**
   * Deletes a specific solution indetified by its id.
   * @param uri The uri of the solution entry to delete.
   */
  removeSolutionEntryByUri(uri: string): void;
}
