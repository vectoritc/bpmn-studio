import {browser, by, element, ElementFinder, ExpectedConditions} from 'protractor';

import {By} from 'selenium-webdriver';

export class SolutionExplorer {

  private _diagramIdIdentifier: string = 'diagramList-';
  private _solutionExplorerPanelTag: string = 'solution-explorer-panel';


  }

  }

  }

  private get _solutionExplorerPanelContainer(): ElementFinder {
    const panelContainerByTag: By = by.tagName(this._solutionExplorerPanelTag);

    return element(panelContainerByTag);
  }

  private _getDiagramEntry(diagramName: string): ElementFinder {
    const diagramEntryById: string = this._diagramIdIdentifier + diagramName;
    const byId: By = by.id(diagramEntryById);

    return element(byId);
  }

}
