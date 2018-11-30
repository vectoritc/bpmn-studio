import {IDiagram} from '@process-engine/solutionexplorer.contracts';

import {ISolutionEntry} from './ISolutionEntry';

export interface ISolutionService {
  /**
   * Adds a SolutionEntry to the service.
   * @param solutionEntry The SolutionEntry to add.
   */
  addSolutionEntry(solutionEntry: ISolutionEntry): void;

  /**
   * Closes the given SolutionEntry and deletes it from the service.
   * @param solutionEntry The SolutionEntry to close.
   */
  closeSolutionEntry(solutionEntry: ISolutionEntry): void;

  /**
   * Gets the currently active SolutionEntry.
   */
  getActiveSolutionEntry(): ISolutionEntry;

  /**
   * Gets a specific SolutionEntry identified by its URI.
   * @param uri The uri of the searched SolutionEntry.
   */
  getSolutionEntryForUri(uri: string): ISolutionEntry;

  /**
   * Sets the active Solution
   * @param solution The new active SolutionEntry.
   */
  setActiveSolution(solution: ISolutionEntry): void;
}
