# Logs of the UI thread

## bundled and not bundled

Add `mainWindow.toggleDevTools();` to your application, and it will start with
the chrome dev tools opened, even when bundled.

# Logs of the main thread

## For the non-bundled app

When launching the electron app from your terminal (e.g.
`electron electron_app/electron.js`), the logs of your main thread will appear
in your terminal.

## For the Bundled app

The tricky thing about the logs in the bundled app is to start the bundled app
from the terminal.

### On Windows

Just run the `.exe` from cmd and you'll get the logs in your cmd window

### On OS X

On OS X, the bundled app (the thing that ends with `.app`) is just a folder.
Use your terminal and navigate to `your-app.app/Contents/MacOS`. In there is a
single executable file. Execute it from your terminal (`./your-app`). You'll see
the logs of your main thread appear in your terminal

### Caveats

When executing the bundled application from a terminal, the working directory
of the application is different to when you execute it by double-clicking. This
effects everything in the application that is based on the working directory,
for example something like a default config path

In OS X, the working directory is `/`.

# How to Bundle Config With Your app

- Add the config to your bundle. Add this to your package.json:
  ```JavaScript
  "build": {
    "extraFiles": [
      "config/**/*"
    ]
  }
  ```
- install electron-is-dev:
  ```bash
  npm install --save electron-is-dev
  ```
- Make the config settable via environment variable
- Set that environment variable in your electron.js:
  ```JavaScript
  const isDev = require('electron-is-dev');
  if (!isDev) {
    // __dirname is (in this case) ./your-app.app/Contents/Resources/app.asar/electron_app
    // config is in ./your-app/Contents/config
    process.env.CONFIG_PATH = path.join(__dirname, '..', '..', '..', 'config');
  }
  ```

# Extract Info From the Bundled Application Without Starting it From the Terminal

If you must absolutely not mess with the working directory, and still need
some info you can tell node to print it to a file for you:

```JavaScript
const fs = require('fs');

// tell me where your corrent working-directory is!
fs.writeFileSync('/Users/heiko/Desktop/working_dir.txt', process.cwd(), 'utf8');
```

# Debugging the UI Thread

Use the regular chrome dev tools to debug your ui

# Debugging the Main Thread

(see https://electronjs.org/docs/tutorial/debugging-main-process)

Start your application with the `--inspect` or `inspect-brk` flags, just like
you'd do with a regular node application:

```bash
./node_modules/.bin/electron --inspect electron_app/electron.js
```
