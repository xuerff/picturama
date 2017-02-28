import { ipcMain, shell } from 'electron';
import moment from 'moment';
import notifier from 'node-notifier';
import fs from 'fs';
import Promise from 'bluebird';
import exiv2 from 'exiv2';

import Scanner from './scanner';
import config from './config';
import metadata from './metadata';

import walker from './lib/walker';

import Tag from './models/tag';
import Photo from './models/photo';
import Version from './models/version';

const exGetImgTags = Promise.promisify(exiv2.getImageTags);

class Library {

  constructor(mainWindow) {
    this.mainWindow = mainWindow;

    this.scanForTags = this.scanForTags.bind(this);
    this.scan = this.scan.bind(this);
    this.emptyTrash = this.emptyTrash.bind(this);
    this.fixMissingVersions = this.fixMissingVersions.bind(this);

    if (fs.existsSync(config.settings)) {
      let settings = require(config.settings);

      this.path = settings.directories.photos;
      this.versionsPath = settings.directories.versions;

      if (!fs.existsSync(config.thumbsPath))
        fs.mkdirSync(config.thumbsPath);

      if (!fs.existsSync(config.thumbs250Path))
        fs.mkdirSync(config.thumbs250Path);
    }

    if (!fs.existsSync(config.tmp))
      fs.mkdirSync(config.tmp);

    ipcMain.on('start-scanning', this.scan);
    ipcMain.on('empty-trash', this.emptyTrash);
  }

  fixMissingVersions() {
    Version
      .query(qb => {
        return qb
          .innerJoin('photos', 'versions.photo_id', 'photos.id')
          .where('output', null)
          .orWhere('thumbnail', null);
      })
      //.fetchAll({ withRelated: ['photo'] })
      .fetchAll()
      .then(versions => {
        console.log('empty versions', versions.toJSON());
      });
  }

  emptyTrash() {
    new Photo()
      .where({ trashed: 1 })
      .fetchAll({ withRelated: ['versions', 'tags'] })
      .then(photos => photos.toJSON())
      .map((photo) => {
        return Promise
          .each(
            [ 'master', 'thumb', 'thumb_250' ],
            (key => shell.moveItemToTrash(photo[key]))
          )
          .then(() => {
            return new Photo({ id: photo.id })
              .destroy();
          })
          .then(() => photo);
      })
      .then((photos) => {
        this.mainWindow.webContents.send(
          'photos-trashed',
          photos.map(photo => photo.id)
        );
      });
  }

  walk(file) {
    if (file.isRaw)
      return this.importRaw(file);
    else
      return this.importImg(file);
  }

  walkForTags(file) {
    return exGetImgTags(file.path)
      .then(metadata.process)
      .then((data) => {
        if (data.tags.length > 0)
          return data.tags;
        else
          throw('no-tag');
      })
      .each((tagName) => {
        return new Tag({ title: tagName })
          .fetch()
          .then((tag) => {
            if (tag)
              return tag;
            else
              return new Tag({ title: tagName }).save();
          });
      })
      .catch(() => {
        return false;
      });
  }

  scan() {
    var start = new Date().getTime();
    this.mainWindow.webContents.send('start-import', true);

    if (!this.path || !this.versionsPath)
      return false;
    new Scanner(this.path, this.versionsPath, this.mainWindow)
      .scanPictures()
      .then((pics) => {
        let end = new Date().getTime();
        let time = moment.duration(end - start);

        this.mainWindow.webContents.send('finish-import', true);

        notifier.notify({
          'title': 'Ansel',
          'message': `Finish importing ${pics.length} in ${time.humanize()}`
        });
      });

    notifier.notify({
      'title': 'Ansel',
      'message': 'Start import'
    });
  }

  scanForTags() {
    var start = new Date().getTime();
    this.mainWindow.webContents.send('start-import', true);

    if (!this.path || !this.versionsPath)
      return false;

    walker(this.path, [ this.versionsPath ])
      .then(this.prepare.bind(this))
      .then(this.setTotal.bind(this))
      .map(this.walkForTags.bind(this), {
        concurrency: config.concurrency
      })
      .then((pics) => {
        let end = new Date().getTime();
        let time = moment.duration(end - start);

        this.mainWindow.webContents.send('finish-import', true);

        notifier.notify({
          'title': 'Ansel',
          'message': `Finish importing tags ${pics.length} in ${time.humanize()}`
        });
      });

    notifier.notify({
      'title': 'Ansel',
      'message': 'Start import'
    });
  }
}

export default Library;
