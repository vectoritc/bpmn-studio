import {IDiagram} from '@process-engine/solutionexplorer.contracts';

import {ISolutionEntry} from './ISolutionEntry';

export interface IActiveSolutionAndDiagramService {
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
   * Gets the currently active diagram.
   */
  getActiveDiagram(): IDiagram;

  /**
   * Gets a specific SolutionEntry identified by its uri.
   * @param uri The uri of the searched SolutionEntry.
   */
  getSolutionEntryForUri(uri: string): ISolutionEntry;

  /**
   * Sets the combination of the new SolutionEntry and diagram.
   * @param solution The new active SolutionEntry.
   * @param diagram The new active diagram.
   */
  setActiveSolutionAndDiagram(solution: ISolutionEntry, diagram: IDiagram): void;
}
