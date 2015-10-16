import app from 'app';
import BrowserWindow from 'browser-window';
import ipc from 'ipc';
//import dbus from 'dbus-native';
//import udev from 'udev';
import usbDetect from 'usb-detection';

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
  let mainMenu = new MainMenu(mainWindow, library);

  //library.scan();
  library.watch();

  //var bus = dbus.systemBus();
  //var udservice = bus.getService('org.freedesktop.UDisks');

  //udservice.getInterface(
  //  '/org/freedesktop/UDisks',
  //  'org.freedesktop.UDisks', 
  //  function(err, ud) {
  //    console.log('dbus', err, ud);

  //    ud.on('DeviceAdded', function(deviceObjectPath) {
  //      console.log('DeviceAdded', deviceObjectPath);
  //    });

  //    ud.on('DeviceRemoved', function(deviceObjectPath) {
  //      console.log('DeviceRemoved', deviceObjectPath);
  //    });
  //  }
  //);

  //console.log(udev.list()); // this is a long list :)

  //var monitor = udev.monitor();
  //monitor.on('add', function (device) {
  //    console.log('added ' + device);
  //    monitor.close() // this closes the monitor.
  //});
  //monitor.on('remove', function (device) {
  //    console.log('removed ' + device);
  //});
  //monitor.on('change', function (device) {
  //    console.log('changed ' + device);
  //});
  // Detect add/insert 
  usbDetect.on('add', function(device) { console.log('add', device); });
  usbDetect.on('add:vid', function(device) { console.log('add', device); });
  usbDetect.on('add:vid:pid', function(device) { console.log('add', device); });
   
  // Detect remove 
  usbDetect.on('remove', function(device) { console.log('remove', device); });
  usbDetect.on('remove:vid', function(device) { console.log('remove', device); });
  usbDetect.on('remove:vid:pid', function(device) { console.log('remove', device); });
   
  // Detect add or remove (change) 
  usbDetect.on('change', function(device) { console.log('change', device); });
  usbDetect.on('change:vid', function(device) { console.log('change', device); });
  usbDetect.on('change:vid:pid', function(device) { console.log('change', device); });
   
  // Get a list of USB devices on your system, optionally filtered by `vid` or `pid` 
  //usbDetect.find(function(err, devices) { console.log('find', devices, err); });
  //usbDetect.find(vid, function(err, devices) { console.log('find', devices, err); });
  //usbDetect.find(vid, pid, function(err, devices) { console.log('find', devices, err); });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
