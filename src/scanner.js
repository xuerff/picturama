import config from './config';

import walker from './lib/walker';
import matches from './lib/matches';

const allowed = new RegExp(config.acceptedRawFormats.join('$|') + '$', 'i');
const allowedImg = new RegExp(config.acceptedImgFormats.join('$|') + '$', 'i');

const extract = new RegExp(
  '([^\/]+)\.(' + config.acceptedRawFormats.join('|') + ')$',
  'i'
);

const extractImg = new RegExp(
  '([^\/]+)\.(' + config.acceptedImgFormats.join('|') + ')$',
  'i'
);

export default class Scanner {
  constructor(path, versionsPath) {
    this.path = path;
    this.versionsPath = versionsPath;

    this.scanPictures = this.scanPictures.bind(this);
    this.prepare = this.prepare.bind(this);
  }

  prepare(filePaths) {
    let rawFiles = filePaths.map((filePath) => {
      if (filePath.match(allowed))
        return filePath;
    })
    .filter((filePath) => (filePath));

    let imgFiles = filePaths.map((filePath) => {
      if (filePath.match(allowedImg))
        return filePath;
    })
    .filter((filePath) => (filePath));

    let preparedFiles = rawFiles.map((rawFile) => {
      let filename = rawFile.match(extract)[1];
      let imgPos = matches(imgFiles, filename);

      let element = {
        path: rawFile,
        name: filename,
        isRaw: true
      };

      if (imgPos != -1) {
        element.imgPath = imgFiles[imgPos];

        imgFiles = imgFiles.filter((imgFile) => {
          return (imgFile != imgFiles[imgPos]);
        });
      }

      return element;
    });

    imgFiles.forEach((imgFile) => {
      let filename = imgFile.match(extractImg)[1];

      preparedFiles.push({
        path: imgFile,
        name: filename,
        isRaw: false
      });
    });

    return preparedFiles;
  }

  scanPictures() {
    return walker(this.path, [ this.versionsPath ])
      .then(this.prepare.bind(this))
      .filter(this.filterStoredPhoto.bind(this))
      .then(this.setTotal.bind(this))
      .map(this.walk.bind(this), {
        concurrency: config.concurrency
      });
  }
}
