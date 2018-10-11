export class DiagramTrashFolderService {

  public getDiagramTrashFolder(): string {
    const path: any = (window as any).nodeRequire('path');
    const os: any = (window as any).nodeRequire('os');
    const fs: any = (window as any).nodeRequire('fs');

    const homeFolder: string = os.homedir();

    // On macOS we can use the ~/.Trash/ folder.
    const isMacOS: boolean = os.platform() === 'darwin';
    if (isMacOS) {
      const systemTrashFolder: string = path.join(homeFolder, '.Trash');

      return systemTrashFolder;
    }

    // On all other platforms we use the ~/.bpmn-studio/deleted-diagrams/ folder.

    const bpmnStudioFolder: string = path.join(homeFolder, '.bpmn-studio');
    const deletedDiagramsFolder: string = path.join(bpmnStudioFolder, 'deleted-diagrams');

    const bpmnStudioFolderDoesNotExist: boolean = !fs.existsSync(bpmnStudioFolder);
    if (bpmnStudioFolderDoesNotExist) {
      fs.mkdirSync(bpmnStudioFolder);
    }

    const deletedDiagramsFolderDoesNotExist: boolean = !fs.existsSync(deletedDiagramsFolder);
    if (deletedDiagramsFolderDoesNotExist) {
      fs.mkdirSync(deletedDiagramsFolder);
    }

    return deletedDiagramsFolder;
  }
}
