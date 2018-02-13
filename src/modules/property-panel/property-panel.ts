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
  private moddle: IBpmnModdle;
  private eventBus: IEventBus;
  private elementInPanel: IShape;

  public generalIndextab: any = new General();
  public formsIndextab: any = new Forms();
  public extensionsIndextab: any = new Extensions();

  private currentIndextab: any = this.generalIndextab;
  private indextabs: Array<IIndextab>;

  public attached(): void {
    this.setFirstElement();
    this.indextabs = [
      this.generalIndextab,
      this.formsIndextab,
      this.extensionsIndextab,
    ];

    this.eventBus = this.modeler.get('eventBus');

    this.eventBus.on('element.click', (event: IEvent) => {
      this.elementInPanel = event.element;
      this.indextabs.forEach((indextab: IIndextab) => {
        indextab.canHandleElement = indextab.checkElement(this.elementInPanel);
      });
      if (!this.currentIndextab.canHandleElement) {
        this.currentIndextab = this.generalIndextab;
      }
    });
  }

  public updateLabel(selectedIndextab: any): void {
    this.currentIndextab = selectedIndextab;
  }

  private setFirstElement(): void {
    const selectedEvents: Array<IShape> = this.modeler.get('selection')._selectedElements;
    if (selectedEvents[0]) {
      return;
    } else {
      const rootElements: any = this.modeler._definitions.rootElements;
      const process: IModdleElement = rootElements.find((element: any ) =>  {
        return element.$type === 'bpmn:Process';
      });

      let startEvent: IModdleElement;

      if (process.flowElements) {
        startEvent = process.flowElements.find((element: any ) => {
          return element.$type === 'bpmn:StartEvent';
        });
      }

      if (!startEvent) {
        startEvent = process;
      }

      const elementRegistry: IElementRegistry = this.modeler.get('elementRegistry');
      const elementInPanel: IShape = elementRegistry.get(startEvent.id);

      this.modeler.get('selection').select(elementInPanel);
    }
  }

}
