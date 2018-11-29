export interface IViewbox {
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
  inner: IInnerViewbox;
  outer: IOuterViewbox;
}

export interface IInnerViewbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IOuterViewbox {
  x: number;
  y: number;
  width: number;
  height: number;
}
