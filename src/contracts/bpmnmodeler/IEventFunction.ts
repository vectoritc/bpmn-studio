export interface IEventFunction {
  (this: GlobalEventHandlers, event: Event): void;
}
