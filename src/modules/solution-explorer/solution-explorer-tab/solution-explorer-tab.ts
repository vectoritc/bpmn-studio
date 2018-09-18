import { IInputEvent } from '../../../contracts';
import {SolutionExplorerList} from '../solution-explorer-list/solution-explorer-list';

export class SolutionExplorerTab {

  private _solutionExplorerList: SolutionExplorerList;
  public solutionInput: HTMLInputElement;
  public singleDiagramInput: HTMLInputElement;

  public async refreshSolutions(): Promise<void> {
    return this._solutionExplorerList.refreshSolutions();
  }

  public async openDiagram(): Promise<void> {
    this.singleDiagramInput.click();
  }

  public async openSolution(): Promise<void> {
    this.solutionInput.click();
    // const uri: string = prompt('Enter solution uri:');

    // try {
    //   await this._solutionExplorerList.openSolution(uri);
    // } catch (error) {
    //   console.log('error', error);
    //   alert(`Error opening the uri: ${error.message}`);
    // }
  }

  public canReadFromFileSystem(): boolean {
    return (window as any).nodeRequire;
  }

  /**
   * Handles the file input for the FileSystem Solutions.
   * @param event A event that holds the files that were "uploaded" by the user.
   * Currently there is no type for this kind of event.
   */
  public async onSolutionInputChange(event: IInputEvent): Promise<void> {
    const uri: string = event.target.files[0].path;
    this.solutionInput.value = '';

    try {
      await this._solutionExplorerList.openSolution(uri);
    } catch (error) {
      console.log(error);
      alert(error);
    }
  }

  /**
   * Handles the file input change event for the single file input.
   * @param event An event that holds the files that were "uploaded" by the user.
   * Currently there is no type for this kind of event.
   */
  public async onSingleDiagramInputChange(event: IInputEvent): Promise<void> {
    const uri: string = event.target.files[0].path;
    this.singleDiagramInput.value = '';

    try {
      await this._solutionExplorerList.openSingleDiagram(uri);
    } catch (error) {
      console.log(error);
      alert(error);
    }
  }
}
