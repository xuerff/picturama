import {
  app,
  screen,
  ipcMain,
  BrowserWindow
} from 'electron';

import fs from 'fs';

import MainMenu from './main-menu';
import Usb from './usb';
import config from './config';

const initLibrary = (mainWindow) => {
  const Library = require('./library').default;
  let library = new Library(mainWindow);

  new MainMenu(mainWindow, library);
  library.watch();
};

var mainWindow = null;

if (!fs.existsSync(config.dotAnsel))
  fs.mkdirSync(config.dotAnsel);

app.on('window-all-closed', () => {
  if (process.platform != 'darwin')
    app.quit();
});

app.on('ready', () => {
  let cursorPos = screen.getCursorScreenPoint();
  let workAreaSize = screen.getDisplayNearestPoint(cursorPos).workAreaSize;

  mainWindow = new BrowserWindow({ width: 1356, height: 768, webPreferences: {
    experimentalFeatures: true,
    blinkFeatures: 'CSSGridLayout'
  }});

  if (workAreaSize.width <= 1366 && workAreaSize.height <= 768)
    mainWindow.maximize();

  mainWindow.loadURL('file://' + __dirname + '/../static/index.html');

  if (fs.existsSync(config.settings))
    initLibrary(mainWindow);
  else {
    var knex = require('knex')(config.knex);

    if (!fs.existsSync(config.dbFile))
      knex.migrate.latest().finally(() => {
        return knex.destroy(); //works
      });
  }

  let usb = new Usb();

  usb.scan((err, drives) => {
    mainWindow.webContents.send('scanned-devices', drives);
  });

  usb.watch((err, action, drive) => {
    console.log('new drive', action, drive);

    if (action == 'add')
      mainWindow.webContents.send('add-device', drive);
    else
      mainWindow.webContents.send('remove-device', drive);
  });

  ipcMain.on('settings-created', () => initLibrary(mainWindow));

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
