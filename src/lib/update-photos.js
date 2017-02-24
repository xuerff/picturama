export default function updatePhotos(photos, updatedPhoto) {
  let lastVersion = null;
  let updatedPhotoPos = 0;

  if (updatedPhoto.hasOwnProperty('versions') && updatedPhoto.versions.length > 0) {
    var versionNumber = updatedPhoto.versions.length;
    lastVersion = updatedPhoto.versions[updatedPhoto.versions.length - 1];
    updatedPhoto.thumb = lastVersion.output;
    updatedPhoto.thumb_250 = lastVersion.thumbnail;

    if (Number.isInteger(updatedPhoto.versionNumber))
      updatedPhoto.versionNumber += versionNumber;
    else
      updatedPhoto.versionNumber = versionNumber + 1;
  }

  photos
    .forEach((photo, index) => {
      if (photo.id == updatedPhoto.id)
        updatedPhotoPos = index;
    });

  // If photo has been moved to trashed, we remove it from the array
  if (updatedPhoto.trashed === 1)
    return [
      ...photos.slice(0, updatedPhotoPos),
      ...photos.slice(updatedPhotoPos + 1)
    ];

  else
    return [
      ...photos.slice(0, updatedPhotoPos),
      Object.assign({}, updatedPhotoPos, updatedPhoto),
      ...photos.slice(updatedPhotoPos + 1)
    ];
}
