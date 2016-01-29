import {ExifImage} from 'exif';
import Promise from 'bluebird';

var exifParser = (imgPath) => {
  return new Promise(function (resolve, reject) {
    new ExifImage({ image: imgPath }, (err, exifData) => {
      if (err)
        reject(err);
      else
        resolve(exifData);
    });
  });
};

export default exifParser;
