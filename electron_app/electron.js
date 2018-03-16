const electron = require('electron');
const autoUpdater = require('electron-updater').autoUpdater;
const path = require('path');
const app = electron.app;
const notifier = require('electron-notifications');
const isDev = require('electron-is-dev');

if (!isDev) {
  const userDataFolder = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : '/var/local');
  process.env.datastore__service__data_sources__default__adapter__databasePath = path.join(userDataFolder, 'process-engine_database');

  process.env.CONFIG_PATH = path.join(__dirname, '..', '..', '..', 'config');
}

const pe = require('@process-engine/skeleton-electron');

let mainWindow = null;

const installButtonText = 'Install';
const dismissButtonText = 'Dismiss';

function createWindow () {
  if (mainWindow !== null) {
    return;
  }

  mainWindow = new electron.BrowserWindow({
    width: 1000,
    height: 800,
    title: "BPMN-Studio",
    minWidth: 1000,
    minHeight: 800,
  });

  mainWindow.loadURL(`file://${__dirname}/../index.html`);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  autoUpdater.checkForUpdates();

  autoUpdater.addListener('error', (error) => {
    const notification = notifier.notify('Update error', {
      message: 'Update failed',
      buttons: [dismissButtonText],
    });
    notification.on('buttonClicked', (text, buttonIndex, options) => {
      notification.close();
    });
  });

  autoUpdater.addListener('update-available', (info) => {
    notifier.notify('Update available', {
      message: 'Started downloading',
      buttons: [dismissButtonText],
    });
  });

  autoUpdater.addListener('update-downloaded', (info) => {
    const notification = notifier.notify('Update ready', {
      message: 'Update ready for installation',
      duration: '60000',
      buttons: [installButtonText, dismissButtonText],
    });

    notification.on('buttonClicked', (text, buttonIndex, options) => {
      const installButtonClicked = text === installButtonText;
      if (installButtonClicked) {
        autoUpdater.quitAndInstall();
      } else {
        notification.close();
      }
    })
  });

  var template = [{
    label: "Edit",
    submenu: [
        {
          label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:"
        },
        {
          label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:"
        },
        {
          label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:"
        },
        {
          label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:"
        }
    ]}
  ];
  electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(template));
}

app.on('ready', createWindow);
app.on('activate', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
