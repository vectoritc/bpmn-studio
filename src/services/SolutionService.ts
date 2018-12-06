import {IDiagram} from '@process-engine/solutionexplorer.contracts';
import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {ISolutionEntry, ISolutionService} from '../contracts';
import environment from '../environment';

@inject(EventAggregator)
export class SolutionService implements ISolutionService {
  private _eventAggregator: EventAggregator;
  private _allSolutionEntries: Array<ISolutionEntry> = [];
  private _activeSolution: ISolutionEntry;
  private _activeDiagram: IDiagram;

  constructor(eventAggregator: EventAggregator) {
    this._eventAggregator = eventAggregator;
  }

  public addSolutionEntry(solutionEntry: ISolutionEntry): void {
    this._allSolutionEntries.push(solutionEntry);
  }

  public removeSolutionEntry(solutionEntry: ISolutionEntry): void {
    this._allSolutionEntries.splice(this._allSolutionEntries.indexOf(solutionEntry));
  }

  public getActiveSolutionEntry(): ISolutionEntry {

    return this._activeSolution;
  }

  public getSolutionEntryForUri(uri: string): ISolutionEntry {
    const solutionEntry: ISolutionEntry = this._allSolutionEntries.find((entry: ISolutionEntry) => {
      return entry.uri === uri;
    });

    return solutionEntry;
  }

  public setActiveSolutionEntry(solution: ISolutionEntry): void {
    this._activeSolution = solution;
  }

  public getActiveDiagram(): IDiagram {
    return this._activeDiagram;
  }

  public setActiveDiagram(diagram: IDiagram): void {
    this._activeDiagram = diagram;

    this._eventAggregator.publish(environment.events.navBar.updateActiveSolutionAndDiagram);
  }
}
