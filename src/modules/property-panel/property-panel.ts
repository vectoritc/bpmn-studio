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
  public elementInPanel: IShape;
  public generalIndextab: IIndextab = new General();
  public formsIndextab: IIndextab = new Forms();
  public extensionsIndextab: IIndextab = new Extensions();

  private moddle: IBpmnModdle;
  private eventBus: IEventBus;
  private currentIndextabTitle: string = this.generalIndextab.title;
  private indextabs: Array<IIndextab>;

  public attached(): void {
    this.moddle = this.modeler.get('moddle');
    this.eventBus = this.modeler.get('eventBus');

    this.indextabs = [
      this.generalIndextab,
      this.formsIndextab,
      this.extensionsIndextab,
    ];

    this.indextabs.forEach((indextab: IIndextab) => {
      indextab.canHandleElement = indextab.isSuitableForElement(this.elementInPanel);
      if (indextab.title === this.currentIndextabTitle && !indextab.canHandleElement) {
        this.currentIndextabTitle = this.generalIndextab.title;
      }
    });

    this.eventBus.on(['element.click', 'shape.changed', 'selection.changed'], (event: IEvent) => {

      const elementWasClickedOn: boolean = event.type === 'element.clicked';
      const elementIsValidShape: boolean = event.type === 'shape.changed' && event.element.type !== 'label';

      const elementIsShapeInPanel: boolean = elementIsValidShape && event.element.id === this.elementInPanel.id;

      if (elementWasClickedOn || elementIsShapeInPanel) {
        this.elementInPanel = event.element;
      }

      const selectedElementChanged: boolean = event.type === 'selection.changed' && event.newSelection.length !== 0;

      if (selectedElementChanged) {
        this.elementInPanel = event.newSelection[0];
      }

      this.indextabs.forEach((indextab: IIndextab) => {
        indextab.canHandleElement = indextab.isSuitableForElement(this.elementInPanel);
        if (indextab.title === this.currentIndextabTitle && !indextab.canHandleElement) {
          this.currentIndextabTitle = this.generalIndextab.title;
        }
      });
    });

    this.setFirstElement();

  }

  public updateIndextab(selectedIndextab: IIndextab): void {
    this.currentIndextabTitle = selectedIndextab.title;
  }

  private setFirstElement(): void {
    this.moddle.fromXML(this.xml, ((err: Error, definitions: IDefinition): void => {
      const process: IModdleElement = definitions.rootElements.find((element: IModdleElement) => {
        return element.$type === 'bpmn:Process';
      });
      const startEvent: IModdleElement = process.flowElements.find((element: any ) => {
        return element.$type === 'bpmn:StartEvent';
      });
      if (startEvent.$type !== 'bpmn:StartEvent') {
        startEvent.id = process.flowElements[0].id;
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
