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
  private elementInPanel: IShape;

  public generalIndextab: any = new General();
  public formsIndextab: any = new Forms();
  public extensionsIndextab: any = new Extensions();

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

    this.eventBus.on(['element.click', 'shape.changed', 'selection.changed'], (event: IEvent) => {

      this.elementInPanel = event.element;
      this.indextabs.forEach((indextab: IIndextab) => {
        indextab.canHandleElement = indextab.checkElement(this.elementInPanel);
      });

      if (!this.currentIndextab.checkElement(this.elementInPanel)) {
        this.currentIndextab = this.generalIndextab;
      }
    });
    this.setFirstElement();
  }

  public updateIndextab(selectedIndextab: any): void {
    this.currentIndextab = selectedIndextab;
  }

  private setFirstElement(): void {
    this.moddle.fromXML(this.xml, ((err, definitions) => {
      const process = definitions.rootElements.find((element: IModdleElement) => {
        return element.$type === 'bpmn:Process';
      });
      const start = process.flowElements.find((element) => {
        return element.$type === 'bpmn:StartEvent';
      });
      const registry = this.modeler.get('elementRegistry');
      const startElementShape = registry.get(start.id);
      this.modeler.get('selection').select(startElementShape);
    });
  }

}
