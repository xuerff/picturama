import app from 'app';
import BrowserWindow from 'browser-window';
import usbDetect from 'usb-detection';
import fs from 'fs';
import {spawn} from 'child-process-promise';
import njds from 'nodejs-disks';

import MainMenu from './main-menu';
import Library from './library';

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
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 1356, height: 768 });

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/../static/index.html');

  let library = new Library(mainWindow, app.getAppPath());

  new MainMenu(mainWindow, library);

  //library.scan();
  library.watch();

  usbDetect.on('add', function(device) {
    var devicePath = '/dev/disk/by-id/usb-' + device.manufacturer + '_' + device.deviceName + 
                     '_' + device.serialNumber + '-' + device.deviceAddress +
                     ':' + device.locationId + '-part1';

    console.log('add', device, devicePath);

    setTimeout(function() {
      let devPoint = fs.readlinkSync(devicePath);
      let driveName = devPoint.match(/[a-z]{3}\d{1}/i)[0];

      console.log('dev point', devPoint, devPoint.match(/[a-z]{3}\d{1}/i)[0]);
      njds.drives(function (err, drives) {
        njds.drivesDetail(drives, function (err, data) {
          console.log('njds', data);

          data.forEach(function(drive) {
            if (drive.drive.match(/[a-z]{3}\d{1}$/i)) {
              let targetDriveName = drive.drive.match(/[a-z]{3}\d{1}$/i)[0];
              console.log('drive', drive.drive, drive.drive.match(/[a-z]{3}\d{1}$/i));

              if (targetDriveName == driveName)
                console.log('found', drive.mountpoint);
            }
          });
        });
      });
    }, 2000);
  });
  //usb.on('attach', function(device) {
  //  console.log('device', device);
  //  device.getStringDescriptor(device.deviceDescriptor.iSerialNumber, function(err, data) {
  //    console.log('data', data);
  //  })
  //});

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
