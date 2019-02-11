/* tslint:disable:no-use-before-declare */
/**
 * We are disabling this rule here because we need this kind of statement in the
 * functions used in the promise of the modal.
*/
import {inject} from 'aurelia-framework';

import {IDiagram} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';

import {IEventFunction, NotificationType} from '../../../../contracts/index';
import {NotificationService} from '../../../notification/notification.service';

@inject('NotificationService')
export class DeleteDiagramModal {
  public showModal: boolean = false;
  public diagram: IDiagram;
  public deleteDiagramModal: DeleteDiagramModal = this;

  private _solutionService: ISolutionExplorerService;
  private _notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this._notificationService = notificationService;
  }

  public async show(diagram: IDiagram, solutionService: ISolutionExplorerService): Promise<boolean> {
    this.diagram = diagram;
    this._solutionService = solutionService;

    this.showModal = true;

    const deletionPromise: Promise<boolean> = new Promise((resolve: Function, reject: Function): void => {
      const cancelDeletion: IEventFunction = (): void => {
        this._closeModal();

        resolve(false);

        document.getElementById('cancelDeleteDiagramButton').removeEventListener('click', cancelDeletion);
        document.getElementById('deleteDiagramButton').removeEventListener('click', proceedDeletion);
      };

      const proceedDeletion: IEventFunction = async(): Promise<void> => {
        await this._deleteDiagram();

        resolve(true);

        document.getElementById('cancelDeleteDiagramButton').removeEventListener('click', cancelDeletion);
        document.getElementById('deleteDiagramButton').removeEventListener('click', proceedDeletion);
      };

      setTimeout(() => {
        document.getElementById('cancelDeleteDiagramButton').addEventListener('click', cancelDeletion, {once: true});
        document.getElementById('deleteDiagramButton').addEventListener('click', proceedDeletion, {once: true});
      }, 0);
    });

    return deletionPromise;
  }

  private _closeModal(): void {
    this.diagram = undefined;
    this._solutionService = undefined;

    this.showModal = false;
  }

  private async _deleteDiagram(): Promise<void> {
    try {
      await this._solutionService.deleteDiagram(this.diagram);
    } catch (error) {
      const message: string = `Unable to delete the diagram: ${error.message}`;

      this._notificationService.showNotification(NotificationType.ERROR, message);
    }

    this.diagram = undefined;
    this._solutionService = undefined;

    this.showModal = false;
  }
}
