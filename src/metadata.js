import matches from './lib/matches';

const accessByMatch = (obj, key) => {
  let id = matches(Object.keys(obj), key);
  return obj[Object.keys(obj)[id]];
};

const process = (exData) => {
  let xmp = {
    exposureTime: eval(accessByMatch(exData, 'ExposureTime')),
    iso: parseInt(accessByMatch(exData, 'ISOSpeedRating')),
    focalLength: eval(accessByMatch(exData, 'FocalLength')),
    aperture: eval(accessByMatch(exData, 'FNumber'))
  };

  if (exData.hasOwnProperty('Xmp.dc.subject'))
    xmp.tags = exData['Xmp.dc.subject'].split(', ');

  if (exData.hasOwnProperty('Exif.Image.DateTime'))
    xmp.createdAt = exData['Exif.Image.DateTime'];

  if (exData.hasOwnProperty('Exif.Image.Orientation'))
    xmp.orientation = parseInt(exData['Exif.Image.Orientation']);
  else
    xmp.orientation = 1;

  return xmp;
};

export default { process };
