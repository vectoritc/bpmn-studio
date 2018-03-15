export interface IEventBus {
  on(events: Array<string> | string,
     priority: number,
     callback: Function,
     callbackScope?: any): void;
  on(events: Array<string> | string,
     callback: Function,
     callbackScope?: any): void;

  once(events: Array<string> | string,
       priority: number,
       callback: Function,
       callbackScope: any): void;
  once(events: Array<string> | string,
       callback: Function,
       callbackScope: any): void;
  off(event: string,
      callback?: Function): void;
  fire(nameOrType: string | {type: string},
       data?: any): any;
}
