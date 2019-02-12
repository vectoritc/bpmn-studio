import {RouterView} from './pages/routerView';
import {StatusBar} from './pages/statusBar';

describe('Status Bar', () => {

  let routerView: RouterView;
  let statusBar: StatusBar;

  beforeAll(async() => {
    routerView = new RouterView();
    statusBar = new StatusBar();
  });

  beforeEach(async() => {
    await routerView.init();
    await statusBar.init();
  });

  it('should contain left container.', async() => {
    const visibilityOfLeftContainer: boolean = await statusBar.getVisibilityOfLeftContainer();

    expect(visibilityOfLeftContainer).toBeTruthy();
  });

  it('should contain center container.', async() => {
    const visibilityOfCenterContainer: boolean = await statusBar.getVisibilityOfCenterContainer();

    expect(visibilityOfCenterContainer).toBeTruthy();
  });

  it('should contain right container.', async() => {
    const visibilityOfRightContainer: boolean = await statusBar.getVisibilityOfRightContainer();

    expect(visibilityOfRightContainer).toBeTruthy();
  });
});
