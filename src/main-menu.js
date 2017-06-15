import { ipcMain, Menu } from 'electron';

import config from './config';
import npmPackage from './../package.json';

const template = require(`${config.menusFolder}/linux.json`);

class MainMenu {
  constructor(mainWindow, library) {
    this.mainWindow = mainWindow;
    this.library = library;

    this.render = this.render.bind(this);
    //this.scanForTags = this.scanForTags.bind(this);
    this.reload = this.reload.bind(this);
    this.fullscreen = this.fullscreen.bind(this);
    this.toggleDevTools = this.toggleDevTools.bind(this);
    this.addTags = this.addTags.bind(this);
    this.export = this.export.bind(this);
    this.fixMissingVersions = this.fixMissingVersions.bind(this);

    this.template = template.menu.map(menu => {
      menu.submenu = menu.submenu.map(submenu => {
        if (this.hasOwnProperty(submenu.click))
          submenu.click = this[submenu.click];
        else if (submenu.hasOwnProperty('command'))
          submenu.click = this.bindCommand.bind(this, submenu.command);

        if (submenu.label.toLowerCase() === 'version')
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

  bindCommand(command) {
    this.mainWindow.webContents.send('dispatch-command', command);
  }

  reload() {
    this.mainWindow.restart();
  }

  fullscreen() {
    this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
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

  fixMissingVersions() {
    this.library.fixMissingVersions();
  }

  render() {
    this.menu = Menu.buildFromTemplate(this.template);
    this.mainWindow.setMenu(this.menu);
  }
}

export default MainMenu;
