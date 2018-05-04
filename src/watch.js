import * as chokidar from 'chokidar'

import Version from './models/version';
import config from './config';

const allowed = config.watchedFormats;

export default class Watch {
  constructor(mainWindow) {
    let settings = require(config.settings);

    this.mainWindow = mainWindow;
    this.versionsPath = settings.directories.versions;

    this.watch = this.watch.bind(this);
    this.onVersionAdd = this.onVersionAdd.bind(this);
  }

  onVersionAdd(path) {
    if (path.match(allowed)) {
      Version.updateImage(path.match(allowed)).then(version => {
        if (version)
          this.mainWindow.webContents.send('new-version', version);
      });
    }
  }

  watch() {
    let watcher = chokidar.watch(
      this.versionsPath,
      { awaitWriteFinish: true, ignoreInitial: true }
    );

    watcher.on('add', this.onVersionAdd);
  }
}
