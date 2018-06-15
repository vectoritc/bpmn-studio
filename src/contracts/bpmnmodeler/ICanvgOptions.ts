export interface ICanvgOptions {
  log?: boolean;
  ignoreMouse?: boolean;
  ignoreAnimation?: boolean;
  ignoreDimensions?: boolean;
  ignoreClear?: boolean;
  offsetX?: number;
  offsetY?: number;
  scaleWidth?: number;
  scaleHeight?: number;
  useCORS?: boolean;

  renderCallback?(): void;
  forceRedraw?(): boolean;
}
