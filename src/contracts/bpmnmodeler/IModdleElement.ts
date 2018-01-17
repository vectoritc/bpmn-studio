export interface IModdleElement {
  id: string;
  name: string;
  get: any;
  $type: string;
  $attrs?: any;
  $parent?: IModdleElement;
}
