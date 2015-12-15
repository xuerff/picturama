import {app, screen} from 'electron';
import BrowserWindow from 'browser-window';
//import usbDetect from 'usb-detection';
//import fs from 'fs';
//import {spawn} from 'child-process-promise';
//import njds from 'nodejs-disks';
//import udev from 'udev';

import MainMenu from './main-menu';
import Library from './library';
import Usb from './usb';

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform != 'darwin')
    app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', () => {
  let workAreaSize = screen.getPrimaryDisplay().workAreaSize;
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 1356, height: 768 });

  if (workAreaSize.width <= 1366 && workAreaSize.height <= 768)
    mainWindow.maximize();

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/../static/index.html');

  let library = new Library(mainWindow, app.getAppPath());

  new MainMenu(mainWindow, library);

  new Usb(function(err, drive) {
    console.log('new drive', drive);
  });

  //console.log(udev.list()); // this is a long list :)

  //var monitor = udev.monitor();
  //monitor.on('add', function (device) {
  //  console.log('added ' + device);
  //});
  //monitor.on('remove', function (device) {
  //  console.log('removed ' + device);
  //});
  //monitor.on('change', function (device) {
  //  console.log('changed ' + device);
  //});

  //library.scan();
  library.watch();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
