import { app, BrowserWindow, ipcMain } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { enableLiveReload } from 'electron-compile';
import { readdirSync } from 'fs';
import _ from 'lodash';
import { spawn } from 'child_process';


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let lockPage = false;
let currentPage = 'basic';

let stdData = '';
let errData = '';
let lastExit = 0;
let errText = '';
let hasFailed = false;
let currentProcess;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) enableLiveReload({ strategy: 'react-hmr' });

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    show: false,
  });

  const splash = new BrowserWindow({
    width: 800, height: 600, transparent: true, frame: false, alwaysOnTop: true,
  });
  splash.loadURL(`file://${__dirname}/splash.html`);

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  if (isDevMode) {
    await installExtension(REACT_DEVELOPER_TOOLS);
    mainWindow.webContents.openDevTools();
    mainWindow.setResizable(true);
  }

  mainWindow.once('ready-to-show', () => {
    splash.destroy();
    mainWindow.show();
    if (isDevMode) {
      mainWindow.setSize(1200, 600, true);
    }
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
  //   app.quit();
  // }
  app.quit();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const getUsbTtys = () => {
  const ttyFound = [];
  readdirSync('/dev').forEach((path) => {
    if (path.indexOf('tty') >= 0 && path.indexOf('usb') >= 0) {
      ttyFound.push(path);
    }
  });
  return ttyFound;
};

const setPageLock = (locked) => {
  lockPage = locked;
  mainWindow.webContents.send('locked-page', locked);
};

const basicModeStdOut = (data) => {
  // console.log('stdout: <' + data +'> ');
  stdData += data;
  if (!hasFailed) {
    if (data.includes('Initializing the ds30 Loader engine...')) {
      // console.log('Initialized!');
      mainWindow.webContents.send('basic-set-step', 1);
    } else if (data.includes('Initiating write...')) {
      // console.log('Initiating!');
      mainWindow.webContents.send('basic-set-step', 2);
    } else if (data.includes('Writing flash')) {
      // console.log('Writing!');
      mainWindow.webContents.send('basic-set-step', 3);
    } else if (data.includes('Failed to open port')) {
      errText = data.toString().trim();
    } else if (data.includes('Hex file parse failed')) {
      errText = data.toString().trim();
      hasFailed = true;
      currentProcess.kill();
    }
  }
};

const basicModeStdErr = (data) => {
  // console.log('stderr: ' + data);
  errData += data;
};

const basicModeDone = (code) => {
  // console.log(`exitcode: ${code}`);
  lastExit = code;
  mainWindow.webContents.send('program-return-code', code);
  setPageLock(false);
  if (!_.isEqual(code, 0)) {
    if (errText.length > 0) {
      mainWindow.webContents.send('alert-show-message', `Got the following error message: ${errText}`);
      errText = '';
    } else {
      mainWindow.webContents.send('alert-show-message', 'Something went wrong!');
    }
  }
};

const advancedModeStdOut = (data) => {
  stdData += data;
  mainWindow.webContents.send('advanced-stdout', data);
};

const advancedModeStdErr = (data) => {
  errData += data;
  mainWindow.webContents.send('advanced-stderr', data);
};

const advancedModeDone = (code) => {
  lastExit = code;
  mainWindow.webContents.send('advanced-exit-code', code);
  setPageLock(false);
};


const runProgram = (filepath, tty, device = 'pic24fj256da206', rate = '115200') => {
  const command = `mono ./bin/ds30LoaderConsole.exe -f="${filepath}" -d="${device}" -k="${tty}" -r="${rate}" --writef -o`;
  // let p = process.spawn('mono', [
  //   '../bin/ds30LoaderConsole.exe',
  //   `-f=${filepath}`,
  //   `-d=${device}`,
  //   `-k=${tty}`,
  //   `-r=${rate}`,
  //   '--writef',
  //   '-o',
  // ], { shell: true });
  setPageLock(true);
  hasFailed = false;
  stdData = '';
  errData = '';
  const p = spawn(command, { shell: true });
  // const p = spawn('pwd');

  p.stdout.on('data', basicModeStdOut);
  p.stderr.on('data', basicModeStdErr);
  p.on('close', basicModeDone);
  currentProcess = p;
};

ipcMain.on('request-mainprocess-get-tty', (event) => {
  event.sender.send('mainprocess-response-get-tty', getUsbTtys());
});

ipcMain.on('request-alert-show-message', (event, arg) => {
  event.sender.send('alert-show-message', arg);
});

ipcMain.on('request-change-page', (event, arg) => {
  if (_.isEqual(arg, 'advanced')) {
    mainWindow.setResizable(true);
  } else if (!isDevMode) {
    mainWindow.setSize(800, 600, true);
    mainWindow.setResizable(false);
  }
  if (lockPage) {
    event.sender.send('alert-show-message', 'Please wait for the current process to finish...');
  } else if (!_.isEqual(arg, currentPage)) {
    currentPage = arg;
    event.sender.send('change-page', arg);
  }
});

ipcMain.on('request-mainprocess-program', (event, arg) => {
  if (!arg.advanced) {
    runProgram(arg.filepath, arg.tty);
  }
});

ipcMain.on('request-last-runtime', (event) => {
  event.sender.send('last-runtime', { stdout: stdData, stderr: errData, exit: lastExit });
});
