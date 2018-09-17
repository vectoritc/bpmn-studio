import {SolutionExplorerList} from '../solution-explorer-list/solution-explorer-list';

export class SolutionExplorerTab {

  private _solutionExplorerList: SolutionExplorerList;

  public async refreshSolutions(): Promise<void> {
    return this._solutionExplorerList.refreshSolutions();
  }

  public async openDiagram(): Promise<void> {
    alert('fixme');
  }

  public async openSolution(): Promise<void> {
    const uri: string = prompt('Enter solution uri:');

    try {
      await this._solutionExplorerList.openSolution(uri);
    } catch (error) {
      console.log('error', error);
      alert(`Error opening the uri: ${error.message}`);
    }
  }

  public canReadFromFileSystem(): boolean {
    return (window as any).nodeRequire;
  }
}
