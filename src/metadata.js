//import moment from 'moment';
import Promise from 'bluebird';

import Tag from './models/tag';
import matches from './lib/matches';

const accessByMatch = (obj, key) => {
  let id = matches(Object.keys(obj), key);
  return obj[Object.keys(obj)[id]];
};

const populateTags = (exData) => {
  if (exData && exData.hasOwnProperty('Xmp.dc.subject'))
    return Promise.map(exData['Xmp.dc.subject'].split(', '), (tagName) => {
      return new Tag({ title: tagName })
        .fetch()
        .then((tag) => {
          if (tag)
            return tag;
          else
            return new Tag({ title: tagName }).save();
        });
    });

  else return [];
};

const process = (exData) => {
  let xmp = {
    exposureTime: eval(accessByMatch(exData, 'ExposureTime')),
    iso: parseInt(accessByMatch(exData, 'ISOSpeedRating')),
    focalLength: eval(accessByMatch(exData, 'FocalLength')),
    aperture: eval(accessByMatch(exData, 'FNumber')),
    tags: populateTags(exData)
  };

  if (exData.hasOwnProperty('Exif.Image.DateTime'))
    xmp.createdAt = exData['Exif.Image.DateTime'];
  else
    console.log('no date time', exData);

  if (exData.hasOwnProperty('Exif.Image.Orientation'))
    xmp.orientation = parseInt(exData['Exif.Image.Orientation']);
  else
    xmp.orientation = 1;

  return xmp;
};

export default { process };
