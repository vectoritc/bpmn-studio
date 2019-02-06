import {inject} from 'aurelia-framework';

import {IDiagram} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';

import {NotificationType} from '../../../../contracts/index';
import {NotificationService} from '../../../notification/notification.service';

@inject('NotificationService')
export class DeleteDiagramModal {
  public showModal: boolean = false;

  private _diagram: IDiagram;
  private _solutionService: ISolutionExplorerService;
  private _notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this._notificationService = notificationService;
  }

  public async show(diagram: IDiagram, solutionService: ISolutionExplorerService): Promise<boolean> {
    this._diagram = diagram;
    this._solutionService = solutionService;

    this.showModal = true;

    const deletionPromise: Promise<boolean> = new Promise((resolve: Function, reject: Function): boolean | void => {
      setTimeout(() => {
        document.getElementById('cancelDeleteDiagramButton').addEventListener('click', () => {
          this._closeModal();
          resolve(false);
        }, {once: true});

        document.getElementById('deleteDiagramButton').addEventListener('click', async() => {
          await this._deleteDiagram();
          resolve(true);
        }, {once: true});
      }, 0);
    });

    return deletionPromise;
  }

  private _closeModal(): void {
    this._diagram = undefined;
    this._solutionService = undefined;

    this.showModal = false;
  }

  private async _deleteDiagram(): Promise<void> {
    try {
      await this._solutionService.deleteDiagram(this._diagram);
    } catch (error) {
      const message: string = `Unable to delete the diagram: ${error.message}`;

      this._notificationService.showNotification(NotificationType.ERROR, message);
    }

    this._diagram = undefined;
    this._solutionService = undefined;

    this.showModal = false;
  }
}
