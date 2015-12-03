import Menu from 'menu';
import {ipcMain} from 'electron';

import template from './../menus/linux.json';

class MainMenu {
  constructor(mainWindow, library) {
    this.mainWindow = mainWindow;
    this.library = library;

    this.render = this.render.bind(this);
    this.scan = this.scan.bind(this);
    this.close = this.close.bind(this);
    this.reload = this.reload.bind(this);
    this.fullscreen = this.fullscreen.bind(this);
    this.toggleDevTools = this.toggleDevTools.bind(this);
    this.addTags = this.addTags.bind(this);

    this.template = template.menu.map((menu) => {
      menu.submenu = menu.submenu.map((submenu) => {
        if (this.hasOwnProperty(submenu.click))
          submenu.click = this[submenu.click];

        return submenu;
      });

      return menu;
    });

    ipcMain.on('toggleAddTagMenu', (e, state) => {
      this.menu.items[2].submenu.items[0].enabled = state;
    });

    this.render();
  }

  scan() {
    this.library.scan();
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

  render() {
    this.menu = Menu.buildFromTemplate(this.template);
    this.mainWindow.setMenu(this.menu);
  }
}

export default MainMenu;
