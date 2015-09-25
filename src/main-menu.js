import Menu from 'menu';

class MainMenu {
  constructor(mainWindow, library) {
    this.mainWindow = mainWindow;
    this.library = library;

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
    }];

    this.menu = Menu.buildFromTemplate(this.template);
    this.mainWindow.setMenu(this.menu);
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
}

export default MainMenu;
