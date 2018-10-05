export class DiagramTrashFolderService {

  public getDiagramTrashFolder(): string {
    const path: any = (window as any).nodeRequire('path');
    const os: any = (window as any).nodeRequire('os');

    const homeFolder: string = os.homedir();
    const diagramTrashFolder: string = path.join(homeFolder, '.Trash');

    return diagramTrashFolder;
  }
}
