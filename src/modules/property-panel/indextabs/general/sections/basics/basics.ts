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
  private saveId: string;
  private idErrors: Array<String> = [];
  private idIsInvalid: Boolean = false;

  public businessObjInPanel: IModdleElement;
  public elementDocumentation: string;

  public activate(model: IPageModel): void {

    this.elementInPanel = model.elementInPanel;
    this.businessObjInPanel = model.elementInPanel.businessObject;
    this.saveId = model.elementInPanel.businessObject.id;
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

  private getFlowElements(): Array<IModdleElement> {
    const processIds: Array<string> = this.getProcessIds();
    let flowElements: Array<IModdleElement> = [];

    for (const processId of processIds) {
      const hat: IModdleElement = this.moddle.ids._seed.hats[processId];
      const hasFlowElements: boolean = hat !== undefined && hat.flowElements !== undefined;
      if (hasFlowElements) {
        flowElements = flowElements.concat(hat.flowElements);
      }
    }

    return flowElements || [];
  }

  private getLaneElements(): Array<IModdleElement> {
    const hats: Array<IModdleElement> = this.moddle.ids._seed.hats;

    const lanes: Array<IModdleElement> = [];
    for (const hatId in hats) {
      if (hats[hatId].$type === 'bpmn:Lane') {
        lanes.push(hats[hatId]);
       }
    }
    return lanes || [];
  }

  private getPoolElements(): Array<IModdleElement> {
    const hats: Array<IModdleElement> = this.moddle.ids._seed.hats;
    let pools: Array<IModdleElement>;

    for (const currentElementId in hats) {
      const currentElement: IModdleElement = hats[currentElementId];
      if (currentElement.$type === 'bpmn:Collaboration') {
        pools = currentElement.participants.map((pool: IModdleElement) => {
          return pool;
        });
        break;
      }
    }

    return pools || [];
  }

  private getProcesses(): Array<IModdleElement> {
    const processes: Array<IModdleElement> = [];
    const hats: Array<IModdleElement> = this.moddle.ids._seed.hats;

    for (const currentElementId in hats) {
      const currentElement: IModdleElement = hats[currentElementId];
      if (currentElement.$type === 'bpmn:Process' || currentElement.$type === 'bpmn:SubProcess') {
        processes.push(currentElement);
      }
    }

    return processes;
  }

  private getElements(): Array<IModdleElement> {
    const flowElements: Array<IModdleElement> = this.getFlowElements();
    const lanes: Array<IModdleElement> = this.getLaneElements();
    const pools: Array<IModdleElement> = this.getPoolElements();
    const processes: Array<IModdleElement> = this.getProcesses();

    const elements: Array<IModdleElement> = lanes.concat(flowElements)
      .concat(pools)
      .concat(processes);

    return elements || [];
  }

  private getProcessIds(): Array<string> {
    const processes: Array<IModdleElement> = this.getProcesses();
    const hats: Array<IModdleElement> = this.moddle.ids._seed.hats;
    const processIds: Array<string> = [];

    for (const hat in hats) {
      if (hats[hat].$type === 'bpmn:Process' || hats[hat].$type === 'bpmn:SubProcess') {
        processIds.push(hat);
      }
    }

    return processIds;
  }

  private resetId(): void {
    this.businessObjInPanel.id = this.saveId;
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
      this.businessObjInPanel.id = this.saveId;
    }
  }
}
