import * as bundle from '@process-engine/bpmn-js-custom-bundle';
import {bindable} from 'aurelia-framework';
import {IBpmnModeler, IBpmnModelerConstructor, IEvent, IEventBus} from '../../contracts';
import environment from '../../environment';

export class BpmnIo {

  @bindable() public xml: string;
  private modeler: IBpmnModeler;
  private eventBus: IEventBus;
  private commandStack: any;

  public attached(): void {
    this.modeler = new bundle.modeler({
      container: '#canvas',
      propertiesPanel: {
        parent: '#js-properties-panel',
      },
      additionalModules: bundle.additionalModules,
      moddleExtensions: {
        camunda: bundle.camundaModdleDescriptor,
      },
    });

    if (this.xml !== undefined && this.xml !== null) {
      this.modeler.importXML(this.xml, (err: Error) => {
        return 0;
      });
    }

    this.eventBus = this.modeler.get('eventBus');
    this.eventBus.on('selection.changed', (event: any) => {
      // console.log(event);
      // console.log(this.modeler.get('selection'));
    });
  }

  public getSelection(): Object {
    return this.modeler.get('selection');
  }

  public distributeElements(): void {
    this.commandStack = this.modeler.get('commandStack');
    // this.eventBus.fire('elements.distribute');
    // console.log(this.modeler.get('elements.align'));
    // console.log('test');
    // console.log(this.commandStack);
    // console.log(this.eventBus);
    // console.log(this.modeler);
    // this.modeler.trigger('distributeElements');
    // this.eventBus.fire('distributeElements');
    // const selections = this.getSelection();
    // const elements = selections._selectedElements;

    // if (elements.length < 3) {
    //   return;
    // }
    // let groups;
    // let distributableElements;

    // this.modeler._setOrientation('horizontal');
    // this.modeler.set('orientation', 'left');
    // distributableElements = this.modeler._filterElements(elements);
    // groups = this.modeler._createGroups(distributableElements);

    // if (groups.length <= 2) {
    //   return;
    // }

    // let context = {
    //   groups: groups,
    //   axis: axis,
    //   dimension: dimension,
    // };

    // this.commandStack.execute('elements.distribute', context);
    // this.modeler.distributeElements(groups, this.modeler._axis, this.modeler._dimension);
    this.commandStack.triggerEditorActions('distributeElements', {type: 'horizontal'});

  }

  public xmlChanged(newValue: string, oldValue: string): void {
    if (this.modeler !== undefined && this.modeler !== null) {
      this.modeler.importXML(this.xml, (err: Error) => {
        return 0;
      });
    }
  }

  public getXML(): Promise<string> {
    return new Promise((resolve: Function, reject: Function): void => {
      this.modeler.saveXML({}, (err: Error, result: string) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  public getSVG(): Promise<string> {
    return new Promise((resolve: Function, reject: Function): void => {
      this.modeler.saveSVG({}, (err: Error, result: string) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

}
