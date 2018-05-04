import { ipcMain, Menu, BrowserWindow } from 'electron'

import config from './config';
import * as npmPackage from './../package.json'

const template = require(config.menuPath);

class MainMenu {
  constructor(mainWindow, library) {
    this.mainWindow = mainWindow;
    this.library = library;

    this.render = this.render.bind(this);
    this.scan = this.scan.bind(this);
    this.scanForTags = this.scanForTags.bind(this);
    this.close = this.close.bind(this);
    this.reload = this.reload.bind(this);
    this.fullscreen = this.fullscreen.bind(this);
    this.toggleDevTools = this.toggleDevTools.bind(this);
    this.toggleSandbox = this.toggleSandbox.bind(this);
    this.addTags = this.addTags.bind(this);
    this.export = this.export.bind(this);
    this.fixMissingVersions = this.fixMissingVersions.bind(this);

    this.template = template.menu.map(menu => {
      menu.submenu = menu.submenu.map(submenu => {
        if (this.hasOwnProperty(submenu.click))
          submenu.click = this[submenu.click];

        if (submenu.label.toLowerCase() === 'version')
          submenu.label = `Version ${npmPackage.version}`;

        return submenu;
      });

      return menu;
    });

    ipcMain.on('toggleAddTagMenu', (e, state) => {
      this.getMenuItemById('addTags').enabled = state
    });

    ipcMain.on('toggleExportMenu', (e, state) => {
      this.getMenuItemById('export').enabled = state
    });

    this.render();
  }

  getMenuItemById(id) {
    // According to API docs an electron menu should have a `getMenuItemById` method, but it's not there
    // -> We do it by hand
    for (let item of this.menu.items) {
      for (let subItem of item.submenu.items) {
        if (subItem.id === id) {
          return subItem
        }
      }
    }
  }

  scan() {
    this.library.scan();
  }

  scanForTags() {
    this.library.scanForTags();
  }

  close() {
    this.mainWindow.close();
  }

  reload() {
    this.mainWindow.reload()
    if (this.sandboxWindow) {
      this.sandboxWindow.reload()
    }
  }

  fullscreen() {
    this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
  }

  toggleDevTools() {
    this.mainWindow.toggleDevTools();
  }

  toggleSandbox() {
    if (this.sandboxWindow) {
      this.sandboxWindow.close()
      this.sandboxWindow = null
    } else {
      this.sandboxWindow = new BrowserWindow({
        title: 'UI Sandbox',
        webPreferences: {
          experimentalFeatures: true,
          blinkFeatures: 'CSSGridLayout'
        }
      })
      this.sandboxWindow.maximize()
      this.sandboxWindow.loadURL('file://' + __dirname + '/../static/sandbox.html')
      this.sandboxWindow.toggleDevTools()
    }
  }

  addTags() {
    this.mainWindow.webContents.send('addTagClicked', true);
  }

  export() {
    this.mainWindow.webContents.send('exportClicked', true);
  }

  fixMissingVersions() {
    this.library.fixMissingVersions();
  }

  render() {
    this.menu = Menu.buildFromTemplate(this.template);
    Menu.setApplicationMenu(this.menu);
  }
}

export default MainMenu;
