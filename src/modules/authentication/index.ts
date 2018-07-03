import {FrameworkConfiguration} from 'aurelia-framework';
import {AuthenticationRepository} from './authentication.repository';
import {AuthenticationService} from './authentication.service';
import {NewAuthenticationService} from './new_authentication.service';

export async function configure(config: FrameworkConfiguration): Promise<void> {
  config.container.registerSingleton('AuthenticationRepository', AuthenticationRepository);
  config.container.registerSingleton('AuthenticationService', AuthenticationService);
  config.container.registerSingleton('NewAuthenticationService', NewAuthenticationService);
  await config.container.get('AuthenticationService').initialize();
}
