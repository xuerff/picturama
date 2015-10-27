import app from 'app';
import BrowserWindow from 'browser-window';
import usb from 'usb';

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

  usb.on('attach', function(device) {
    //let vid = device.deviceDescriptor.idVendor;
    //let pid = device.deviceDescriptor.idProduct;
    //let term = usb.findByIds(vid, pid);
    console.log('device', device);
    device.getStringDescriptor(device.deviceDescriptor.iSerialNumber, function(err, data) {
      console.log('data', data);
    })
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
