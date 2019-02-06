import {inject} from 'aurelia-framework';

import {IDiagram} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';

import {NotificationType} from '../../../../contracts';
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

  public show(diagram: IDiagram, solutionService: ISolutionExplorerService): void {
    this._diagram = diagram;
    this._solutionService = solutionService;

    this.showModal = true;
  }

  public closeModal(): void {
    this._diagram = undefined;
    this._solutionService = undefined;

    this.showModal = false;
  }

  public async deleteDiagram(): Promise<void> {
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
