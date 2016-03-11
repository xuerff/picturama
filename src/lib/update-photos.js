export default function updatePhotos(photos, updatedPhoto) {
  let lastVersion = null;
  let updatedPhotoPos = 0;

  if (updatedPhoto.hasOwnProperty('versions') && updatedPhoto.versions.length > 0) {
    var versionNumber = updatedPhoto.versions.length;
    //lastVersion = updatedPhoto.versions.pop();
    lastVersion = updatedPhoto.versions[updatedPhoto.versions.length - 1];
    updatedPhoto.thumb = lastVersion.output;
    updatedPhoto.thumb_250 = lastVersion.thumbnail;
    updatedPhoto.versionNumber += versionNumber;
  }

  photos.forEach((photo, index) => {
    if (photo.id == updatedPhoto.id)
      updatedPhotoPos = index;
  });

  console.log('upd photo', photos, updatedPhoto, updatedPhotoPos);

  return [
    ...photos.slice(0, updatedPhotoPos),
    Object.assign({}, updatedPhotoPos, updatedPhoto),
    ...photos.slice(updatedPhotoPos + 1)
  ];

  //return photos.map((photo) => {
  //  photo.versionNumber = 1;

  //  if (photo.id == updatedPhoto.id) {
  //    photo = updatedPhoto;

  //    if (lastVersion) {
  //      console.log('last version', lastVersion);
  //      photo.thumb = lastVersion.output;
  //      photo.thumb_250 = lastVersion.thumbnail;
  //      photo.versionNumber += versionNumber;
  //    }
  //  }

  //  return photo;
  //});


}
