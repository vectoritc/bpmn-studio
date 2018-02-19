import {bindable} from 'aurelia-framework';
import {IBpmnModdle,
        IBpmnModeler,
        IDefinition,
        IElementRegistry,
        IEvent,
        IEventBus,
        IIndextab,
        IModdleElement,
        IModeling,
        IShape} from '../../contracts';
import {Extensions} from './indextabs/extensions/extensions';
import {Forms} from './indextabs/forms/forms';
import {General} from './indextabs/general/general';

export class PropertyPanel {

  @bindable()
  public modeler: IBpmnModeler;
  @bindable()
  public xml: string;
  private moddle: IBpmnModdle;
  private eventBus: IEventBus;
  private elementInPanel: IModdleElement;

  public generalIndextab: IIndextab = new General();
  public formsIndextab: IIndextab = new Forms();
  public extensionsIndextab: IIndextab = new Extensions();

  private currentIndextabTitle: string = this.generalIndextab.title;
  private indextabs: Array<IIndextab>;

  public attached(): void {
    this.moddle = this.modeler.get('moddle');

    this.indextabs = [
      this.generalIndextab,
      this.formsIndextab,
      this.extensionsIndextab,
    ];

    this.eventBus = this.modeler.get('eventBus');

    this.indextabs.forEach((indextab: IIndextab) => {
      indextab.canHandleElement = indextab.checkElement(this.elementInPanel);
      if (indextab.title === this.currentIndextabTitle && !indextab.canHandleElement) {
        this.currentIndextabTitle = this.generalIndextab.title;
      }
    });

    this.setFirstElement();

    this.eventBus.on(['element.click', 'shape.changed', 'selection.changed'], (event: IEvent) => {
      if (event.type === 'element.click') {
        this.elementInPanel = event.element.businessObject;
      }
      if (event.type === 'shape.changed' &&
          event.element.type !== 'label' &&
          event.element.id === this.elementInPanel.id) {
        this.elementInPanel = event.element.businessObject;
      }
      if (event.type === 'selection.changed' && event.newSelection.length !== 0) {
        this.elementInPanel = event.newSelection[0].businessObject;
      }
      this.indextabs.forEach((indextab: IIndextab) => {
        indextab.canHandleElement = indextab.checkElement(this.elementInPanel);
        if (indextab.title === this.currentIndextabTitle && !indextab.canHandleElement) {
          this.currentIndextabTitle = this.generalIndextab.title;
        }
      });
    });

  }

  public updateIndextab(selectedIndextab: IIndextab): void {
    this.currentIndextabTitle = selectedIndextab.title;
  }

  private setFirstElement(): void {
    let startEvent: IModdleElement;
    this.moddle.fromXML(this.xml, ((err: Error, definitions: IDefinition): void => {
      const process: IModdleElement = definitions.rootElements.find((element: IModdleElement) => {
        return element.$type === 'bpmn:Process';
      });

      if (process.flowElements) {
        startEvent = process.flowElements.find((element: any ) => {
          return element.$type === 'bpmn:StartEvent';
        });

        if (!startEvent && process.flowElements) {
          startEvent = process.flowElements[0];
        }
      }

      if (!startEvent) {
        startEvent = process;
      }

      const elementRegistry: IElementRegistry = this.modeler.get('elementRegistry');
      const elementInPanel: IShape = elementRegistry.get(startEvent.id);

      this.modeler.get('selection').select(elementInPanel);
    }));
  }

  private xmlChanged(newValue: string, oldValue: string): void {
    if (oldValue) {
      this.setFirstElement();
      this.updateIndextab(this.generalIndextab);
    }
  }

}
