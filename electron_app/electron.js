const electron = require('electron');
const autoUpdater = require('electron-updater').autoUpdater;
const CancellationToken = require('electron-updater').CancellationToken;
const path = require('path');
const app = electron.app;
const isDev = require('electron-is-dev');
const getPort = require('get-port');
const fs = require('fs');

const {dialog} = require('electron');

const openAboutWindow = require('about-window').default;

// If BPMN-Studio was opened by double-clicking a .bpmn file, then the
// following code tells the frontend the name and content of that file;
// this 'get_opened_file' request is emmitted in src/main.ts.
let filePath;
let isInitialized = false;

let canNotCloseApplication = false;

const Main = {};

/**
 * This variable gets set when BPMN-Studio is ready to work with Files that are
 * openend via double click.
 */
let fileOpenMainEvent;

Main._window = null;


Main.execute = function () {
  /**
   * This method gets called when BPMN-Studio starts for the first time. When it
   * starts it's the first instance, therefore this functions returns "false"
   * and the following if-clause will start BPMN-Studio.
   *
   * If you double-click on a .bpmn file, the callback will be called again,
   * but this time "argv" will hold the command line arguments the second
   * instance would have been started with.
   *
   * Since this would be the second instance the method in the second instance
   * will return "true" and therefore quit the instance. The callback of the
   * first instance allows us to send the double-click event to the renderer
   * process and finally open a file via double-click.
   *
   */
  const existingInstance = app.makeSingleInstance((argv, workingDirectory) => {
    const noArgumentsSet = argv[1] === undefined;

    if (noArgumentsSet) {
      return;
    }

    const argumentIsFilePath = argv[1].endsWith('.bpmn');
    const argumentIsSignInRedirect = argv[1].startsWith('bpmn-studio://signin-oidc');
    const argumentIsSignOutRedirect = argv[1].startsWith('bpmn-studio://signout-oidc');

    if (argumentIsFilePath) {
      const filePath = argv[1];
      Main._bringExistingInstanceToForeground();

      answerOpenFileEvent(filePath)
    }

    if (argumentIsSignInRedirect || argumentIsSignOutRedirect) {
      const redirectUrl = argv[1];

      Main._window.loadURL(`file://${__dirname}/../index.html`);
      Main._window.loadURL('/');

      electron.ipcMain.once('deep-linking-ready', (event) => {
        Main._window.webContents.send('deep-linking-request', redirectUrl);
      });
    }

  });

  if (existingInstance) {
    // Quit the new instance if required
    app.quit();

  } else {
    // If this is the first instance then start the application
    Main._startInternalProcessEngine();

    Main._initializeApplication();

  }
}


Main._initializeApplication = function () {

  app.on('ready', () => {
    Main._createMainWindow();
  });

  app.on('activate', () => {
    if (Main._window === null) {
      Main._createMainWindow();
    }
  });

  initializeDeepLinking();
  initializeAutoUpdater();
  initializeFileOpenFeature();

  function initializeDeepLinking() {

    app.setAsDefaultProtocolClient('bpmn-studio');

    // open-url is called every time someone tries to open a link like:
    // bpmn-studio://myActualUrl
    app.on('open-url', (event, url) => {
      console.log('open-url called', url);
      event.preventDefault();

      // This bug seems to be causing the oidc-client to use a hard redirect
      // instead of using an iFrame:
      // https://github.com/electron/electron/issues/9581

      Main._bringExistingInstanceToForeground();

      // ----------------------------------------------------------------------
      // Hacky Implicit Flow in Electron ©2018 5Minds
      // ----------------------------------------------------------------------

      // The Login

      // 1. trigger sign in on oidc-client
      // 2. get redirected to IdentityServer login page
      // 3. login on that page
      // 4. get redirected to the custom protocol
      //    (bpmn-studio://signin-oidc#<<token_data_goes_here>>)
      // 5. electron main process navigates the browser window from Identity
      //    Server login page to Aurelia application
      // 6. electron main process sends the extracted token data from the signin
      //    response to the Aurelia application
      // 7. oidc client fetches the data via push state
      // 8. login state is propagated through application

      // ----------------------------------------------------------------------

      // The Logout

      // 1. send http request to IdentityServer for logout
      //    (/connect/endsession)
      // 2. if success, open Identity Server success page as a separate window
      // 3. if finish link in the new window is clicked, get redirected to
      //    custom protocol (bpmn-studio://signout-oidc)
      // 4. electron main process sends the signout to the Aurelia application
      // 5. state is cleared and logout state is propagated through application

      // ----------------------------------------------------------------------

      if (url.startsWith('bpmn-studio://signin-oidc')) {

        // If this is the signin response from the implicit OAuth flow,
        // we need to navigate to the start page to activate the Aurelia
        // application again. Due to the bug referenced above, the login page of
        // the IdentityServer is opened in the same window, so that the Aurelia
        // application closes down.

        Main._window.loadURL(`file://${__dirname}/../index.html`);

        Main._window.loadURL('/');

        // Once the Aurelia application is ready to accept deep linking
        // requests, we can send the url with the id_token and access_token
        // contained in the query params of the url.
        electron.ipcMain.once('deep-linking-ready', (event) => {
          Main._window.webContents.send('deep-linking-request', url);
        });
      } else {

        // Because the logout portion of the implicit workflow is handled
        // manually, the Identity Server dialog can be opened in a separate
        // window, so that the Aurelia application keeps running.
        // Therefore we can directly send the url for the deep linking request.
        Main._window.webContents.send('deep-linking-request', url);
      }

    });
  }

  function initializeAutoUpdater() {

    const prereleaseRegex = /\d+\.\d+\.\d+-pre-b\d+/;

    electron.ipcMain.on('app_ready', async(event) => {
      autoUpdater.autoDownload = false;

      autoUpdater.checkForUpdates();

      const currentVersion = electron.app.getVersion();
      const currentVersionIsPrerelease = prereleaseRegex.test(currentVersion);
      autoUpdater.allowPrerelease = currentVersionIsPrerelease;

      const downloadCancellationToken = new CancellationToken();

      console.log(`CurrentVersion: ${currentVersion}, CurrentVersionIsPrerelease: ${currentVersionIsPrerelease}`);

      autoUpdater.addListener('error', (error) => {
        event.sender.send('update_error');
      });

      autoUpdater.addListener('update-available', (info) => {
        event.sender.send('update_available');

        electron.ipcMain.on('download_update', (event) => {
          autoUpdater.downloadUpdate(downloadCancellationToken);
        });
      });

      autoUpdater.addListener('update-downloaded', (info) => {
        event.sender.send('update_downloaded');

        electron.ipcMain.on('quit_and_install', (event) => {
          autoUpdater.quitAndInstall();
        });
      });
    })



  }

  function initializeFileOpenFeature() {
    app.on('window-all-closed', () => {
      app.quit();
      filePath = undefined;
    });

    app.on('will-finish-launching', () => {
      // for windows
      if (process.platform == 'win32' && process.argv.length >= 2) {
        filePath = process.argv[1];
      }

      // for non-windows
      app.on('open-file', (event, path) => {
        filePath = isInitialized
                   ? undefined
                   : path;

        if (isInitialized) {
          answerOpenFileEvent(path);
        }
      });

    });


    /**
     * Wait for the "waiting"-event signalling the app has started and the
     * component is ready to handle events.
     *
     * Set the fileOpenMainEvent variable to make it accesable by the sending
     * function "answerOpenFileEvent".
     *
     * Register an "open-file"-listener to get the path to file which has been
     * clicked on.
     *
     * "open-file" gets fired when someone double clicks a .bpmn file.
     */
    electron.ipcMain.on('waiting-for-double-file-click', (mainEvent) => {
      this.fileOpenMainEvent = mainEvent;
      isInitialized = true;
    });

    electron.ipcMain.on('get_opened_file', (event) => {
      if (filePath === undefined) {
        event.returnValue = {};
        return;
      }

      event.returnValue = {
        path: filePath,
        content: fs.readFileSync(filePath, 'utf8'),
      }
      filePath = undefined;
      app.focus();

    });

  }

}

function answerOpenFileEvent(filePath) {
  this.fileOpenMainEvent.sender.send('double-click-on-file', filePath);
}

Main._createMainWindow = function () {

  console.log('create window called');

  setElectronMenubar();

  Main._window = new electron.BrowserWindow({
    width: 1300,
    height: 800,
    title: "BPMN-Studio",
    minWidth: 1300,
    minHeight: 800,
    icon: path.join(__dirname, '../build/icon.png'), // only for windows and linux
    titleBarStyle: 'hiddenInset'
  });

  Main._window.loadURL(`file://${__dirname}/../index.html`);
  // We need to navigate to "/" because something in the push state seems to be
  // broken if we carry a file system link as the last item of the browser
  // history.
  Main._window.loadURL('/');

  Main._window.on('close', (event) => {
    if (canNotCloseApplication) {
      event.preventDefault();

      Main._window.webContents.send('show-close-modal');

      return false;
    }
  });

  electron.ipcMain.on('close-bpmn-studio', (event) => {
    Main._window.close();
  });

  electron.ipcMain.on('can-not-close', (event, canCloseResult) => {
    canNotCloseApplication = canCloseResult;
  });

  Main._window.on('closed', (event) => {
    Main._window = null;
  });

  setOpenSingleDiagram();
  setOpenSolutions();

  const platformIsWindows = process.platform === 'win32';
  if (platformIsWindows) {
    Main._window.webContents.session.on('will-download', (event, downloadItem) => {
      const defaultFilename = downloadItem.getFilename();

      const fileTypeIndex = defaultFilename.lastIndexOf('.') + 1;
      const fileExtension = defaultFilename.substring(fileTypeIndex);

      const fileExtensionIsBPMN = fileExtension === 'bpmn';
      const fileType = fileExtensionIsBPMN ? 'BPMN (.bpmn)' : `Image (.${fileExtension})`;

      const filename = dialog.showSaveDialog({
        defaultPath: defaultFilename,
        filters: [
          {
            name: fileType,
            extensions: [fileExtension]
          },
          {
            name: 'All Files',
            extensions: ['*']
          }
        ]
      });

      const downloadCanceled = filename === undefined;
      if (downloadCanceled) {
        downloadItem.cancel();

        return;
      }

      downloadItem.setSavePath(filename);
    });
  }

  function setOpenSingleDiagram() {
    electron.ipcMain.on('open_single_diagram', (event) => {
      const openedFile = dialog.showOpenDialog({
        filters: [
          {
            name: "BPMN",
            extensions: ["bpmn", "xml"]
          },
          {
            name: 'All Files',
            extensions: ['*']
          }
        ]
      });

      event.sender.send('import_opened_single_diagram', openedFile);
    });
  }

  function setOpenSolutions() {
    electron.ipcMain.on('open_solution', (event) => {
      const openedFile = dialog.showOpenDialog({
        properties: [
          'openDirectory',
          'createDirectory'
        ]
      });

      event.sender.send('import_opened_solution', openedFile);
    });
  }

  function setElectronMenubar() {

    const getApplicationMenu = () => {
      return {
        label: "BPMN-Studio",
        submenu: [{
            label: "About BPMN-Studio",
            click: () =>
            openAboutWindow({
              icon_path: isDev ? path.join(__dirname, '..', 'build/icon.png') : path.join(__dirname, '../../../build/icon.png'),
              product_name: 'BPMN-Studio',
              bug_report_url: 'https://github.com/process-engine/bpmn-studio/issues/new',
              homepage: 'www.process-engine.io',
              copyright: 'Copyright © 2018 process-engine',
              win_options: {
                minimizable: false,
                maximizable: false,
                resizable: false,
              },
              package_json_dir: __dirname,
            }),
          },
          {
            type: "separator",
          },
          {
            label: "Quit",
            role: "quit",
          },
        ],
      };
    };

    const getFileMenu = () => {
      return {
        label: "File",
        submenu: [
          {
            label: "Open Diagram",
            accelerator: "CmdOrCtrl+O",
            click: () => {
              Main._window.webContents.send('menubar__start_opening_diagram');
            },
          },
          {
            label: "Open Solution",
            accelerator: "CmdOrCtrl+Shift+O",
            click: () => {
              Main._window.webContents.send('menubar__start_opening_solution');
            },
          },
        ],
      };
    };

    const getEditMenu = () => {
      return {
        label: "Edit",
        submenu: [{
            label: "Undo",
            accelerator: "CmdOrCtrl+Z",
            selector: "undo:",
          },
          {
            label: "Redo",
            accelerator: "CmdOrCtrl+Shift+Z",
            selector: "redo:",
          },
          {
            type: "separator",
          },
          {
            label: "Cut",
            accelerator: "CmdOrCtrl+X",
            selector: "cut:",
          },
          {
            label: "Copy",
            accelerator: "CmdOrCtrl+C",
            selector: "copy:",
          },
          {
            label: "Paste",
            accelerator: "CmdOrCtrl+V",
            selector: "paste:",
          },
          {
            label: "Select All",
            accelerator: "CmdOrCtrl+A",
            selector: "selectAll:",
          },
        ],
      };
    };

    const getWindowMenu = () => {
      const windowMenu = {
        label: "Window",
        submenu: [],
      };

      windowMenu.submenu.push({
        role: "minimize",
      });
      windowMenu.submenu.push({
        role: "close",
      });
      windowMenu.submenu.push({
        type: "separator",
      });

      if (isDev) {
        windowMenu.submenu.push({
          role: "reload",
        });
      }

      windowMenu.submenu.push({
        role: "toggledevtools",
      });

      return windowMenu;
    };

    const getHelpMenu = () => {
      return {
        label: "Help",
        submenu: [{
          label: "Documentation",
          click: () => {
            const documentation_url = 'https://www.process-engine.io/documentation/';
            electron.shell.openExternal(documentation_url);
          }
        }, {
          label: "Release Notes for Current Version",
            click: () => {
              const currentVersion = electron.app.getVersion();
              const currentReleaseNotesUrl = `https://github.com/process-engine/bpmn-studio/releases/tag/v${currentVersion}`
              electron.shell.openExternal(currentReleaseNotesUrl);
            }
        }]
      };
    };

    let template = [
      getApplicationMenu(),
      getFileMenu(),
      getEditMenu(),
      getWindowMenu(),
      getHelpMenu(),
    ];

    electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(template));
  }
}

Main._startInternalProcessEngine = async function () {

  const devUserDataFolderPath = path.join(__dirname, '..', 'userData');
  const prodUserDataFolderPath = app.getPath('userData');

  const userDataFolderPath = isDev ? devUserDataFolderPath : prodUserDataFolderPath;

  if (!isDev) {
    process.env.CONFIG_PATH = path.join(__dirname, '..', '..', '..', 'config');
  }

  const getPortConfig = {
    port: 8000,
    host: '0.0.0.0'
  };

  return getPort(getPortConfig)
    .then(async (port) => {

      console.log(`Internal ProcessEngine starting on port ${port}.`);

      process.env.http__http_extension__server__port = port;

      const processEngineDatabaseFolderName = 'process_engine_databases';

      process.env.process_engine__process_model_repository__storage = path.join(userDataFolderPath, processEngineDatabaseFolderName, 'process_model.sqlite');
      process.env.process_engine__flow_node_instance_repository__storage = path.join(userDataFolderPath, processEngineDatabaseFolderName, 'flow_node_instance.sqlite');
      process.env.process_engine__timer_repository__storage = path.join(userDataFolderPath, processEngineDatabaseFolderName, 'timer.sqlite');

      let internalProcessEngineStatus = undefined;
      let internalProcessEngineStartupError = undefined;
      const processEngineStatusListeners = [];

      function _sendInternalProcessEngineStatus(sender) {
        let serializedStartupError;
        const processEngineStartSuccessful = (internalProcessEngineStartupError !== undefined &&
          internalProcessEngineStartupError !== null);

        if (processEngineStartSuccessful) {
          serializedStartupError = JSON.stringify(
            internalProcessEngineStartupError,
            Object.getOwnPropertyNames(internalProcessEngineStartupError));

        } else {
          serializedStartupError = undefined;
        }

        sender.send(
          'internal_processengine_status',
          internalProcessEngineStatus,
          serializedStartupError);
      }

      function _publishProcessEngineStatus() {
        processEngineStatusListeners.forEach(_sendInternalProcessEngineStatus);
      }

      /* When someone wants to know to the internal processengine status, he
       * must first send a `add_internal_processengine_status_listener` message
       * to the event mechanism. We recieve this message here and add the sender
       * to our listeners array.
       *
       * As soon, as the processengine status is updated, we send the listeners a
       * notification about this change; this message contains the state and the
       * error text (if there was an error).
       *
       * If the processengine status is known by the time the listener registers,
       * we instantly respond to the listener with a notification message.
       *
       * This is quite a unusual pattern, the problem this approves solves is the
       * following: It's impossible to do interactions between threads in
       * electron like this:
       *
       *  'renderer process'              'main process'
       *          |                             |
       *          o   <<<- Send Message  -<<<   x
       *
       * -------------------------------------------------
       *
       * Instead our interaction now locks like this:
       *
       *  'renderer process'              'main process'
       *          |                             |
       *          x   >>>--  Subscribe  -->>>   o
       *          o   <<<- Send Message  -<<<   x
       *          |       (event occurs)        |
       *          o   <<<- Send Message  -<<<   x
       */
      electron.ipcMain.on('add_internal_processengine_status_listener', (event) => {
        if (!processEngineStatusListeners.includes(event.sender)) {
          processEngineStatusListeners.push(event.sender);
        }

        if (internalProcessEngineStatus !== undefined) {
          _sendInternalProcessEngineStatus(event.sender);
        }
      });

      // This tells the frontend the location at which the electron-skeleton
      // will be running; this 'get_host' request ist emitted in src/main.ts.
      electron.ipcMain.on('get_host', (event) => {
        event.returnValue = `localhost:${port}`;
      });


      // TODO: Check if the ProcessEngine instance is now run on the UI thread.
      // See issue https://github.com/process-engine/bpmn-studio/issues/312
      try {

        // Create path for sqlite database in BPMN-Studio context.
        const userDataFolderPath = require('platform-folders').getConfigHome();
        const sqlitePath = `${userDataFolderPath}/bpmn-studio/process_engine_databases`;

        // Start the PE by just running the code of process_engine_runtime.
        await require('@process-engine/process_engine_runtime')(sqlitePath);

        console.log('Internal ProcessEngine started successfully.');
        internalProcessEngineStatus = 'success';

        _publishProcessEngineStatus();
      } catch (error) {
        console.error('Failed to start internal ProcessEngine: ', error);
        internalProcessEngineStatus = 'error';
        internalProcessEngineStartupError = error;

        _publishProcessEngineStatus();
      }

    });

}

Main._bringExistingInstanceToForeground = function () {

  if (Main._window) {

    if (Main._window.isMinimized()) {
      Main._window.restore();
    }

    Main._window.focus();
  }
}

// Run our main class
Main.execute();
