import Menu from 'menu';
import {ipcMain} from 'electron';

class MainMenu {
  constructor(mainWindow, library) {
    this.mainWindow = mainWindow;
    this.library = library;
    this.render = this.render.bind(this);

    //this.addTagEnabled = false;

    this.template = [{
      label: 'File',
      submenu: [{
        label: 'Scan',
        accelerator: 'Ctrl+R',
        click: this.scan.bind(this)
      },
      {
        label: 'Close',
        accelerator: 'Ctrl+Q',
        click: this.close.bind(this)
      }]
    },
    {
      label: 'View',
      submenu: [{
        label: 'Reload',
        accelerator: 'Shift+Ctrl+R',
        click: this.fullscreen.bind(this)
      },
      {
        label: 'Enter Fullscreen',
        accelerator: 'F11',
        click: this.fullscreen.bind(this)
      },
      {
        label: 'Toggle DevTools',
        accelerator: 'Shift+Ctrl+I',
        click: this.toggleDevTools.bind(this)
      }]
    },
    {
      label: 'Tags',
      submenu: [{
        label: 'Add tag',
        accelerator: 'Ctrl+T',
        enabled: false,
        click: this.addTag.bind(this)
      }]
    }];

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

  addTag() {
    this.mainWindow.webContents.send('addTagClicked', true);
  }

  render() {
    this.menu = Menu.buildFromTemplate(this.template);
    this.mainWindow.setMenu(this.menu);
  }
}

export default MainMenu;
