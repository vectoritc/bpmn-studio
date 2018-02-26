import {
  IBpmnModdle,
  IBpmnModeler,
  IElementRegistry,
  IModdleElement,
  IModeling,
  IPageModel,
  ISection,
  IShape,
} from '../../../../../../contracts';

export class BasicsSection implements ISection {

  public path: string = '/sections/basics/basics';
  public canHandleElement: boolean = true;
  private modeling: IModeling;
  private modeler: IBpmnModeler;
  private moddle: IBpmnModdle;
  private elementInPanel: IShape;
  private previousId: string;
  private idErrors: Array<String> = [];
  private idIsInvalid: Boolean = false;

  public businessObjInPanel: IModdleElement;
  public elementDocumentation: string;

  public activate(model: IPageModel): void {

    this.elementInPanel = model.elementInPanel;
    this.businessObjInPanel = model.elementInPanel.businessObject;
    this.previousId = model.elementInPanel.businessObject.id;
    this.modeling = model.modeler.get('modeling');
    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;

    this.init();

    this.checkId();
  }

  public isSuitableForElement(element: IShape): boolean {
    if (element === undefined || element === null) {
      return false;
    }
    return true;
  }

  private init(): void {
    if (!this.businessObjInPanel) {
      return;
    }
    if (this.businessObjInPanel.documentation && this.businessObjInPanel.documentation.length > 0) {
      this.elementDocumentation = this.businessObjInPanel.documentation[0].text;
    } else {
      this.elementDocumentation = '';
    }
  }

  private getXML(): string {
    let xml: string;
    this.modeler.saveXML({format: true}, (err: Error, diagrammXML: string) => {
      xml = diagrammXML;
    });
    return xml;
  }

  private updateDocumentation(): void {
    this.elementInPanel.documentation = [];

    const documentation: IModdleElement = this.moddle.create('bpmn:Documentation',
    { text: this.elementDocumentation });
    this.elementInPanel.documentation.push(documentation);

    this.modeling.updateProperties(this.elementInPanel, {
      documentation: this.elementInPanel.documentation,
    });
  }

  private clearId(): void {
    this.businessObjInPanel.id = '';
    this.checkId();
    this.updateId();
  }

  private clearName(): void {
    this.businessObjInPanel.name = '';
    this.updateName();
  }

  private clearDocumentation(): void {
    this.elementDocumentation = '';
    this.updateDocumentation();
  }

  private updateName(): void {
    this.modeling.updateProperties(this.elementInPanel, {
      name: this.businessObjInPanel.name,
    });
  }

  private updateId(): void {
    this.checkId();
    this.modeling.updateProperties(this.elementInPanel, {
      id: this.businessObjInPanel.id,
    });
  }

  private resetId(): void {
    this.businessObjInPanel.id = this.previousId;
  }

  private checkId(): void {
    this.idErrors = [];
    this.idIsInvalid = false;

    const elementRegistry: IElementRegistry = this.modeler.get('elementRegistry');
    const elementsWithSameId: Array<IShape> =  elementRegistry.filter((element: IShape) => {
      if (element.businessObject !== this.businessObjInPanel) {
        if (element.type !== 'label') {
          return element.businessObject.id === this.businessObjInPanel.id;
        }
      }
      return false;
    });

    const hasSameIdWithOtherElements: Boolean = elementsWithSameId.length > 0;
    const idIsEmpty: Boolean = this.businessObjInPanel.id.length <= 0;
    if (hasSameIdWithOtherElements) {
      this.idErrors.push('Id is already existing!');
      this.idIsInvalid = true;
    }
    if (idIsEmpty) {
      this.idErrors.push('Id is empty!');
      this.idIsInvalid = true;
    }

    if (this.idIsInvalid) {
      this.resetId();
    }
  }
}
