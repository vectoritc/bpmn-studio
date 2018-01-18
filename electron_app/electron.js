const electron = require('electron');
const {autoUpdater} = require('electron-updater');
const app = electron.app;
const notifier = require('electron-notifications');

let mainWindow = null;
function createWindow () {
  if (mainWindow !== null) {
    return;
  }

  mainWindow = new electron.BrowserWindow({width: 800, height: 600});

  mainWindow.loadURL(`file://${__dirname}/../index.html`);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  autoUpdater.checkForUpdates();

  autoUpdater.addListener('error', (error) => {
    const notification = notifier.notify('Update error', {
      message: 'Update failed',
      buttons: ['Dismiss'],
    });
    notification.on('buttonClicked', (text, buttonIndex, options) => {
      notification.close();
    });
  });

  autoUpdater.addListener('update-available', (info) => {
    notifier.notify('Update available', {
      message: 'Started downloading',
    });
  });

  autoUpdater.addListener('update-downloaded', (info) => {
    const notification = notifier.notify('Update ready', {
      message: 'Update ready for installation',
      duration: '60000',
      buttons: ['Install', 'Dismiss'],
    });

    notification.on('buttonClicked', (text, buttonIndex, options) => {
      if (text == 'Install') {
        autoUpdater.quitAndInstall();
      } else {
        notification.close();
      }
    })
  });


}

app.on('ready', createWindow);
app.on('activate', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
