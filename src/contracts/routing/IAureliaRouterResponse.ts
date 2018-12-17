import {NavigationInstruction, PipelineResult} from 'aurelia-router';

export interface IAureliaRouterResponse {
  instruction: NavigationInstruction;
  result: PipelineResult;
}
