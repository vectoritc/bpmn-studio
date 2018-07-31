import {FrameworkConfiguration} from 'aurelia-framework';
import {AuthenticationService} from './authentication.service';

export async function configure(config: FrameworkConfiguration): Promise<void> {
  config.container.registerSingleton('AuthenticationService', AuthenticationService);
}
