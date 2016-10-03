import {ipcMain, Menu} from 'electron';

import config from './config';
import npmPackage from './../package.json';

const template = require(`${config.menusFolder}/linux.json`);

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
    this.addTags = this.addTags.bind(this);
    this.export = this.export.bind(this);

    this.template = template.menu.map((menu) => {
      menu.submenu = menu.submenu.map((submenu) => {
        if (this.hasOwnProperty(submenu.click))
          submenu.click = this[submenu.click];

        if (submenu.label.toLowerCase() == 'version')
          submenu.label = `Version ${npmPackage.version}`;

        return submenu;
      });

      return menu;
    });

    ipcMain.on('toggleAddTagMenu', (e, state) => {
      this.menu.items[2].submenu.items[0].enabled = state;
    });

    ipcMain.on('toggleExportMenu', (e, state) => {
      this.menu.items[0].submenu.items[0].enabled = state;
    });

    this.render();
  }

  scan() {
    this.library.scan();
  }

  scanForTags() {
    console.log('scan for tags listener');
    this.library.scanForTags();
  }

  close() {
    this.mainWindow.close();
  }

  reload() {
    this.mainWindow.restart();
  }

  fullscreen() {
    this.mainWindow.setFullScreen((!this.mainWindow.isFullScreen()));
  }

  toggleDevTools() {
    this.mainWindow.toggleDevTools();
  }

  addTags() {
    this.mainWindow.webContents.send('addTagClicked', true);
  }

  export() {
    this.mainWindow.webContents.send('exportClicked', true);
  }

  render() {
    this.menu = Menu.buildFromTemplate(this.template);
    this.mainWindow.setMenu(this.menu);
  }
}

export default MainMenu;
