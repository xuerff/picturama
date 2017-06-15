import { ipcMain } from 'electron';

export default class MainCommands {
  constructor(mainWindow, library) {
    this.mainWindow = mainWindow;
    this.library = library;

    const selectors = {
      'core:scan': () => this.library.scan(),
      'core:scan-for-tags': () => this.library.scanForTags(),
      'core:quit': () => this.mainWindow.close()
    };

    ipcMain.on('command', (e, command) => {
      if (selectors.hasOwnProperty(command))
        selectors[command]();
    });
  }
}
