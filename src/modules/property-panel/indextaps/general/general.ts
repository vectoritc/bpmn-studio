import {ISection} from '../../../../contracts';
import {BasicsSection} from './sections/basics/basics';
import {CallActivitySection} from './sections/call-activity/call-activity';
import {ErrorEventSection} from './sections/error-event/error-event';
import {FlowSection} from './sections/flow/flow';
import {MessageEventSection} from './sections/message-event/message-event';
import {PoolSection} from './sections/pool/pool';
import {ScriptTaskSection} from './sections/script-task/script-task';
import {SignalEventSection} from './sections/signal-event/signal-event';

export class General {
  public title: string = 'General';
  public path: string = '/indextaps/general/general';
  public sections: Array<ISection>;

  public basicsSection: ISection = new BasicsSection();
  public poolSection: ISection = new PoolSection();
  public messageEventSection: ISection = new MessageEventSection();
  public signalEventSection: ISection = new SignalEventSection();
  public scriptTaskSection: ISection = new ScriptTaskSection();
  public callActivitySection: ISection = new CallActivitySection();
  public flowSection: ISection = new FlowSection();
  public errorEventSection: ISection = new ErrorEventSection();

  public canHandleElement: boolean = true;

  public attached(): void {
    this.sections = [
      this.basicsSection,
      this.poolSection,
      this.messageEventSection,
      this.signalEventSection,
      this.scriptTaskSection,
      this.callActivitySection,
      this.flowSection,
      this.errorEventSection,
    ];
  }

}
