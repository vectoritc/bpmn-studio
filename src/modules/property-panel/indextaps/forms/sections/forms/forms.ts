import {IBpmnModeler,
  IBpmnModelerConstructor,
  IEvent,
  IEventBus,
  IModdleElement,
  IModeling,
  IPageModel,
  ISection,
  IShape} from '../../../../../../contracts';

export class FormSection implements ISection {

  public path: string = '/sections/forms/forms';
  public canHandleElement: boolean = false;

  private elementInPanel: IShape;
  private businessObjInPanel: IModdleElement;
  private eventBus: IEventBus;
  private modeling: IModeling;

  public activate(model: IPageModel): void {
    this.eventBus = model.modeler.get('eventBus');
    this.modeling = model.modeler.get('modeling');

    this.eventBus.on('element.click', (event: IEvent) => {
      console.log(event.element.businessObject);
      this.elementInPanel = event.element;
      this.businessObjInPanel = event.element.businessObject;
    });
  }
}
