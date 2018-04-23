import * as bundle from '@process-engine/bpmn-js-custom-bundle';
import {IProcessDefEntity} from '@process-engine/process_engine_contracts';
import {bindable, inject} from 'aurelia-framework';
import {IChooseDialogOption, NotificationType} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from './../notification/notification.service';

@inject('NotificationService')
export class ImportProcessButton {

  private reader: FileReader = new FileReader();
  private model: any;
  private notificationService: NotificationService;

  @bindable()
  private desiredProcessImportKey: string;
  @bindable()
  private callback: (moddle: any, xml: string) => void;
  @bindable()
  private selectedFiles: FileList;

  private chooseOptions: Array<IChooseDialogOption>;
  private currentImportModdle: any;
  private processes: Array<any>;
  private fileInput: HTMLInputElement;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
    this.model = new bundle.moddle({
      camunda: bundle.camundaModdleDescriptor,
    });
    this.reader.onload = (x: any): void => {
      this.onXmlSelected(x.target.result);
    };
  }

  private detached(): void {
    this.cleanup();
  }

  private onXmlSelected(xml: string): void {
    const reader: bundle.moddleXml.Reader = new bundle.moddleXml.Reader({
      model: this.model,
    });
    const rootHandler: any = reader.handler('bpmn:Definitions');

    reader.fromXML(xml, rootHandler, (err: Error, bpmn: any, context: any) => {

      if (err) {
        this.notificationService.showNotification(NotificationType.ERROR, `File could not be imported: ${err}`);
        return;
      }

      if (context.warnings.length) {
        this.notificationService.showNotification(NotificationType.WARNING, `Warnings during import: ${JSON.stringify(context.warnings)}.`);
      }

      this.currentImportModdle = bpmn;
      this.processes = this.getDefinedProcessesInModdle();

      if (this.processes.length === 0) {
        this.notificationService.showNotification(NotificationType.WARNING, 'Could not find any processes in the diagram.');
        this.abortImport();
      } else if (this.processes.length === 1) {
        this.onProcessModdleSelected(this.processes[0]);
      } else {
        this.chooseOptions = [];
        for (const process of this.processes) {
          this.chooseOptions.push({
            title: `${process.name} (${process.id})`,
            value: process,
          });
        }
      }
    });
  }

  private getDefinedProcessesInModdle(): Array<any> {
    const processes: Array<any> = [];

    for (const rootElement of this.currentImportModdle.rootElements) {
      if (rootElement.$type === 'bpmn:Process') {
        processes.push(rootElement);
      }
    }

    return processes;
  }

  /**
   * Renames the given moddle of a process to fit the process.
   */
  private renameProcessModdle(targetProcess: any): void {
    targetProcess.id = this.desiredProcessImportKey;

    let duplicates: number = 0;
    for (const process of this.processes) {
      if (process !== targetProcess && targetProcess.id === process.id) {
        process.id = `${process.id}-${duplicates}`;
        duplicates++;
      }
    }
  }

  public selectedFilesChanged(): void {
    if (this.selectedFiles !== null && this.selectedFiles.length > 0) {
      this.reader.readAsText(this.selectedFiles[0]);
    }
  }

  public onProcessModdleSelected(processModdle: any): void {
    this.renameProcessModdle(processModdle);
    this.finishImport();
  }

  private cleanup(): void {
    this.chooseOptions = null;
    this.currentImportModdle = null;
    this.selectedFiles = null;
    this.processes = null;
    this.fileInput.value = null;
  }

  private finishImport(): void {
    const writer: any = new bundle.moddleXml.Writer({});
    const xml: string = writer.toXML(this.currentImportModdle);
    if (this.callback) {
      this.callback(this.currentImportModdle, xml);
    }
    this.cleanup();
  }

  public abortImport(): void {
    this.cleanup();
  }
}
