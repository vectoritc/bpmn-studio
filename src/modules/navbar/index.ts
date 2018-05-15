import {FrameworkConfiguration} from 'aurelia-framework';
import {NavBar} from './navbar';

export async function configure(config: FrameworkConfiguration): Promise<void> {
  config.container.registerSingleton('Navbar', NavBar);
  await config.container.get('AuthenticationService').initialize();
}
