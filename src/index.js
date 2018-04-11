import { app, BrowserWindow, ipcMain, shell, Menu } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { enableLiveReload } from 'electron-compile';
import { fixPathForAsarUnpack } from 'electron-util';
import { readdirSync } from 'fs';
import _ from 'lodash';
import path from 'path';
import fixPath from 'fix-path';
import which from 'which';
import { spawn, spawnSync } from 'child_process';


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
let lastOptions = {
  filepath: '',
  tty: null,
  device: '',
  rate: '',
  args: ['--writef', '-o'],
};

const isWin = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const isLin = process.platform === 'linux';
const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) enableLiveReload({ strategy: 'react-hmr' });

fixPath();

const handleRedirect = (e, url) => {
  if (url !== mainWindow.webContents.getURL()) {
    e.preventDefault();
    shell.openExternal(url);
  }
};

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: isWin ? 620 : 600,
    resizable: false,
    show: false,
    icon: `${__dirname}/../static/icons/l1demo.png`,  // Linux needs the icon set in the window.
  });

  const splash = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    icon: `${__dirname}/../static/icons/l1demo.png`,  // Linux needs the icon set in the window.
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

  mainWindow.webContents.on('will-navigate', handleRedirect);
  mainWindow.webContents.on('new-window', handleRedirect);

  const template = [
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteandmatchstyle' },
        { role: 'delete' },
        { role: 'selectall' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: () => { shell.openExternal('http://l1demo.org'); },
        },
      ],
    },
  ];

  if (isDevMode) {
    template[1].submenu.unshift(
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
    );
  }

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });

    // Edit menu
    template[1].submenu.push(
      { type: 'separator' },
      {
        label: 'Speech',
        submenu: [
          { role: 'startspeaking' },
          { role: 'stopspeaking' },
        ],
      },
    );

    // Window menu
    template[3].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' },
    ];
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
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

const getWinComs = () => {
  const devices = [];
  const output = spawnSync('wmic', ['path', 'Win32_SerialPort'], { shell: true });
  const lines = output.stdout.toString().split('\n');
  let startIndex = 0;
  let stopIndex = 0;
  lines.forEach((line) => {
    if (line.startsWith('Availability')) {
      startIndex = line.indexOf('Caption');
      stopIndex = line.indexOf('ConfigManagerErrorCode');
    } else if (_.includes(line, '(COM')) {
      devices.push(`${line.substring(startIndex, stopIndex).trim()}`);
    }
  });
  return devices;
};

const getWinUsbComs = () => {
  const devices = [];
  const output = spawnSync('wmic', ['path', 'Win32_SerialPort'], { shell: true });
  const lines = output.stdout.toString().split('\n');
  lines.forEach((line) => {
    if (_.includes(line, 'USB Serial Port')) {
      const items = line.split(/(\s+)/).filter(e => e.trim().length > 0);
      let comFound = false;
      items.forEach((section) => {
        if (!comFound && _.includes(section, '(COM')) {
          devices.push(`USB Serial Port ${section}`);
          comFound = true;
        }
      });
    }
  });
  return devices;
};

const getAllTtys = () => {
  const ttyFound = [];
  if (isWin) {
    Array.prototype.push.apply(ttyFound, getWinComs());
  } else {
    readdirSync('/dev').forEach((ttyPath) => {
      if (ttyPath.indexOf('tty') >= 0) {
        ttyFound.push(path.join('/dev', ttyPath));
      }
    });
  }
  return ttyFound;
};

const getUsbTtys = () => {
  const ttyFound = [];
  if (isWin) {
    Array.prototype.push.apply(ttyFound, getWinUsbComs());
  } else {
    readdirSync('/dev').forEach((ttyPath) => {
      if (ttyPath.indexOf('tty') >= 0 && ttyPath.indexOf('usb') >= 0) {
        ttyFound.push(ttyPath);
      }
    });
  }
  return ttyFound;
};

const setPageLock = (locked) => {
  lockPage = locked;
  mainWindow.webContents.send('locked-page', locked);
};

const checkForMono = () => {
  try {
    which.sync('mono');
  } catch (error) {
    setPageLock(true);
    currentPage = 'requires_mono';
    mainWindow.webContents.send('change-page', 'requires_mono');
  }
};

const basicModeStdOut = (data) => {
  // console.log('stdout: <' + data +'> ');
  stdData += data;
  if (!hasFailed) {
    if (data.includes('Initializing the ds30 Loader engine...')) {
      mainWindow.webContents.send('basic-set-step', 1);
    } else if (data.includes('Initiating write...')) {
      mainWindow.webContents.send('basic-set-step', 2);
    } else if (data.includes('Writing flash')) {
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
      mainWindow.webContents.send('alert-show-message', `Something went wrong! ${code}`);
    }
  }
  if (isMac) {
    app.dock.bounce('informational');
  }
};

const basicModeError = (error) => {
  setPageLock(false);
  mainWindow.webContents.send('alert-show-message', `Encountered an Error! ${error}`);
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


const runProgram = (filepath, tty, device = 'pic24fj256da206', rate = '115200', args = ['--writef', '-o']) => {
  const exePath = fixPathForAsarUnpack(path.resolve(__dirname, '../bin/ds30LoaderConsole.exe'));

  let realTTY;
  if ((isMac || isLin) && !tty.startsWith('/')) {
    realTTY = `/dev/${tty}`;
  } else if (isWin && _.includes(tty, 'COM')) {
    const comNum = tty.split('COM')[1].split(')')[0];
    realTTY = `COM${comNum}`;
  } else {
    realTTY = tty;
  }

  setPageLock(true);
  hasFailed = false;
  stdData = '';
  errData = '';
  lastOptions = {
    filepath,
    tty: isWin ? tty : realTTY,
    device,
    rate,
    args,
  };

  const command = [
    `-f="${filepath}"`,
    `-d=${device}`,
    `-k="${realTTY}"`,
    `-r=${rate}`,
  ];
  command.push(...args);
  let p;
  if (isWin) {
    p = spawn(`"${exePath}"`, command, { shell: true });
  } else {
    const mono = which.sync('mono');
    command.unshift(`"${exePath}"`);
    p = spawn(mono, command, { shell: true });
  }
  if (_.isEqual(currentPage, 'basic')) {
    p.stdout.on('data', basicModeStdOut);
    p.stderr.on('data', basicModeStdErr);
    p.on('close', basicModeDone);
    p.on('error', basicModeError);
  } else {
    mainWindow.webContents.send('advanced-new-start');
    p.stdout.on('data', advancedModeStdOut);
    p.stderr.on('data', advancedModeStdErr);
    p.on('close', advancedModeDone);
    p.on('error', basicModeError);
  }
  currentProcess = p;
};

ipcMain.on('request-mainprocess-get-last-options', (event) => {
  event.sender.send('mainprocess-response-last-options', lastOptions);
});

ipcMain.on('mainprocess-set-last-options', (event, arg) => {
  const options = arg;
  if (arg.tty && (isMac || isLin)) {
    options.tty = `/dev/${arg.tty}`;
  }
  Object.assign(lastOptions, options);
  // console.log(lastOptions);
});

ipcMain.on('request-mainprocess-get-tty', (event) => {
  event.sender.send('mainprocess-response-get-tty', getUsbTtys());
});

ipcMain.on('request-mainprocess-get-tty-adv', (event) => {
  event.sender.send('mainprocess-response-get-tty-adv', getAllTtys());
});

ipcMain.on('request-alert-show-message', (event, arg) => {
  event.sender.send('alert-show-message', arg);
});

ipcMain.on('request-change-page', (event, arg) => {
  if (_.isEqual(arg, 'advanced')) {
    mainWindow.setResizable(true);
  } else if (!isDevMode) {
    mainWindow.setSize(800, isWin ? 620 : 600, true);
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
  } else {
    runProgram(arg.filepath, arg.tty, arg.device, arg.rate, arg.flags);
  }
});

ipcMain.on('requst-mainprocess-kill-program', () => {
  if (currentProcess) {
    if (isWin) {
      // There is a bug with .kill in windows where it does not actually kill the process...
      spawn('taskkill', ['/pid', `${currentProcess.pid}`, '/f', '/t'], { shell: true });
    } else {
      currentProcess.kill();
    }
  }
  setPageLock(false);
});

ipcMain.on('request-last-runtime', (event) => {
  event.sender.send('last-runtime', { stdout: stdData, stderr: errData, exit: lastExit });
});

ipcMain.on('request-mainprocess-check-requirements', () => {
  if (isMac || isLin) {
    checkForMono();
  }
});
