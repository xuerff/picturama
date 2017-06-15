import { ipcMain } from 'electron';

export default class MainCommands {
  constructor(mainWindow, library) {
    this.mainWindow = mainWindow;
    this.library = library;

    ipcMain.on('core:quit', this.quit.bind(this));
    ipcMain.on('core:scan', this.scan.bind(this));
  }

  scan() {
    this.library.scan();
  }

  quit() {
    this.mainWindow.close();
  }
}
