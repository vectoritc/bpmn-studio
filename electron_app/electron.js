const electron = require('electron');
const app = electron.app;

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
}

app.on('ready', createWindow);
app.on('activate', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
