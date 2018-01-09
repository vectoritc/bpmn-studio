export interface IModdleElement {
  id: string;
  get: any;
  $type: string;
  $attrs?: any;
  $parent?: IModdleElement;
}
