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

}
