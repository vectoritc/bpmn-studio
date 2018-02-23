import {bindable} from 'aurelia-framework';
import {
  IBpmnModdle,
  IBpmnModeler,
  IDefinition,
  IElementRegistry,
  IEvent,
  IEventBus,
  IIndextab,
  IModdleElement,
  IShape,
} from '../../contracts';
import {Extensions} from './indextabs/extensions/extensions';
import {Forms} from './indextabs/forms/forms';
import {General} from './indextabs/general/general';

export class PropertyPanel {

  @bindable()
  public modeler: IBpmnModeler;
  @bindable()
  public xml: string;
  public elementInPanel: IShape;
  public generalIndextab: IIndextab = new General();
  public formsIndextab: IIndextab = new Forms();
  public extensionsIndextab: IIndextab = new Extensions();

  private moddle: IBpmnModdle;
  private eventBus: IEventBus;
  private currentIndextabTitle: string = this.generalIndextab.title;
  private indextabs: Array<IIndextab>;
  private selectedElementId: string;

  public attached(): void {
    this.moddle = this.modeler.get('moddle');
    this.eventBus = this.modeler.get('eventBus');

    this.indextabs = [
      this.generalIndextab,
      this.formsIndextab,
      this.extensionsIndextab,
    ];

    this.updateIndexTabsSuitability();
    this.checkIndexTabSuitability();

    this.eventBus.on(['element.click', 'shape.changed', 'selection.changed'], (event: IEvent) => {
      const elementWasClickedOn: boolean = event.type === 'element.clicked';
      const elementIsValidShape: boolean = event.type === 'shape.changed' && event.element.type !== 'label';

      const elementIsShapeInPanel: boolean = elementIsValidShape && event.element.id === this.elementInPanel.id;

      if (elementWasClickedOn || elementIsShapeInPanel) {
        this.elementInPanel = event.element;
        this.selectedElementId = this.elementInPanel.businessObject.id;
      }

      const selectedElementChanged: boolean = event.type === 'selection.changed' && event.newSelection.length !== 0;

      if (selectedElementChanged) {
        this.elementInPanel = event.newSelection[0];
        this.selectedElementId = this.elementInPanel.businessObject.id;
      }

      this.updateIndexTabsSuitability();
      this.checkIndexTabSuitability();
    });

    this.setFirstElement();

  }

  public updateIndextab(selectedIndextab: IIndextab): void {
    this.currentIndextabTitle = selectedIndextab.title;
  }

  private setFirstElement(): void {
    let firstElement: IModdleElement;
    this.moddle.fromXML(this.xml, ((err: Error, definitions: IDefinition): void => {
      const process: IModdleElement = definitions.rootElements.find((element: IModdleElement) => {
        return element.$type === 'bpmn:Process';
      });

      const processHasFlowElements: boolean = process.flowElements !== undefined && process.flowElements !== null;

      if (processHasFlowElements) {
        firstElement = process.flowElements.find((element: IModdleElement ) => {
          return element.$type === 'bpmn:StartEvent';
        });

        if (!firstElement) {
          firstElement = process.flowElements[0];
        }
      } else if (this.processHasLanes(process)) {
        firstElement = process.laneSets[0].lanes[0];
      }

      if (!firstElement) {
        firstElement = process;
      }

      const elementRegistry: IElementRegistry = this.modeler.get('elementRegistry');
      const elementInPanel: IShape = elementRegistry.get(firstElement.id);

      this.modeler.get('selection').select(elementInPanel);
    }));
  }

  private processHasLanes(process: IModdleElement): boolean {
    const processHasLaneSets: boolean = process.laneSets !== undefined && process.laneSets !== null;
    if (!processHasLaneSets) {
      return false;
    }

    const processHasLanes: boolean = process.laneSets[0].lanes !== undefined && process.laneSets[0].lanes !== null;

    return processHasLanes;
  }

  private xmlChanged(newValue: string, oldValue: string): void {
    if (oldValue) {
      this.setFirstElement();
      this.updateIndextab(this.generalIndextab);
    }
  }

  private updateIndexTabsSuitability(): void {
    for (const indextab of this.indextabs) {
      indextab.canHandleElement = indextab.isSuitableForElement(this.elementInPanel);
    }
  }

  private checkIndexTabSuitability(): void {
    const currentIndexTab: IIndextab = this.indextabs.find((indextab: IIndextab) => {
      return indextab.title === this.currentIndextabTitle;
    });

    if (!currentIndexTab.canHandleElement) {
      this.currentIndextabTitle = this.generalIndextab.title;
    }
  }

}
