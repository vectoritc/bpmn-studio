import {FrameworkConfiguration} from 'aurelia-framework';
import {NewAuthenticationService} from './new_authentication.service';

export async function configure(config: FrameworkConfiguration): Promise<void> {
  config.container.registerSingleton('NewAuthenticationService', NewAuthenticationService);
}
