import {
  app,
  screen,
  ipcMain,
  BrowserWindow
} from 'electron';

import * as fs from 'fs'

import MainMenu from './main-menu';
// import Usb from './usb';
import config from './config';
import Watch from './watch';

const initLibrary = mainWindow => {
  const knex = require('knex')(config.knex);
  const Library = require('./library').default;

  knex.migrate.latest().finally(() => {
    let library = new Library(mainWindow);
    let watcher = new Watch(mainWindow);

    new MainMenu(mainWindow, library);
    watcher.watch();
  });
};

let mainWindow = null;

if (!fs.existsSync(config.dotAnsel))
  fs.mkdirSync(config.dotAnsel);


app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin')
  app.quit();
});

app.on('ready', () => {
  let cursorPos = screen.getCursorScreenPoint();
  let workAreaSize = screen.getDisplayNearestPoint(cursorPos).workAreaSize;

  app.setName('Ansel');

  mainWindow = new BrowserWindow({
    width: 1356,
    height: 768,
    title: 'Ansel',
    webPreferences: {
      experimentalFeatures: true,
      blinkFeatures: 'CSSGridLayout'
    }
  });

  if (workAreaSize.width <= 1366 && workAreaSize.height <= 768)
    mainWindow.maximize();

  mainWindow.loadURL('file://' + __dirname + '/../static/index.html');
  mainWindow.setTitle('Ansel');

  if (fs.existsSync(config.settings))
    initLibrary(mainWindow);
  else {
    const knex = require('knex')(config.knex);

    if (!fs.existsSync(config.dbFile)) {
      knex.migrate.latest().finally(() =>
        knex.destroy() // works
      );
    }
  }

  //let usb = new Usb();
  //
  //usb.scan((err, drives) => {
  //  mainWindow.webContents.send('scanned-devices', drives);
  //});
  //
  //usb.watch((err, action, drive) => {
  //  if (action === 'add')
  //    mainWindow.webContents.send('add-device', drive);
  //  else
  //    mainWindow.webContents.send('remove-device', drive);
  //});

  ipcMain.on('settings-created', () => initLibrary(mainWindow));

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
