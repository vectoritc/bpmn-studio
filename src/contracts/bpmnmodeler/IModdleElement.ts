export interface IModdleElement {
  id: string;
  name: string;
  documentation: string;
  get: any;
  $type: string;
  $attrs?: any;
  $parent?: IModdleElement;
}
