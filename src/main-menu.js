import Menu from 'menu';

class MainMenu {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;

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
    }];

    this.menu = Menu.buildFromTemplate(this.template);
    this.mainWindow.setMenu(this.menu);
  }

  scan() {
    console.log('scan');
  }

  close() {
    this.mainWindow.close();
  }
}

export default MainMenu;
