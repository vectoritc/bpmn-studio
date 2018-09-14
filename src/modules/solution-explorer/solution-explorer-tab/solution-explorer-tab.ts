import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';
import {SolutionExplorerList} from '../solution-explorer-list/solution-explorer-list';

export class SolutionExplorerTab {

  private _solutionExplorerList: SolutionExplorerList;

  public async openNewSolution(): Promise<void> {
    const uri: string = prompt('Enter solution uri:');

    try {
      await this._solutionExplorerList.openSolution(uri);
    } catch (error) {
      console.log('CATCH');
      alert(JSON.stringify(error));
    }
  }

}
