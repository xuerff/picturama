import processDates from './../lib/process-dates';

const updatePhotos = (photos, updatedPhoto) => {

  let lastVersion = null;

  if (updatedPhoto.hasOwnProperty('versions') && updatedPhoto.versions.length > 0) {
    var versionNumber = updatedPhoto.versions.length;
    lastVersion = updatedPhoto.versions.pop();
  }

  return photos.map((photo) => {
    photo.versionNumber = 1;

    if (photo.id == updatedPhoto.id) {
      photo = updatedPhoto;

      if (lastVersion) {
        console.log('last version', lastVersion);
        photo.thumb = lastVersion.output;
        photo.thumb_250 = lastVersion.thumbnail;
        photo.versionNumber += versionNumber;
      }
    }

    return photo;
  });
};

const initialState = {
  importing: false,
  currentDate: null,
  photos: [],
  dates: { years: [] },
  progress: { processed: 0, total: 0 }
};

export default function reducers(state = initialState, action) {
  switch (action.type) {
  case 'GET_PHOTOS_SUCCESS':
    return {
      ...state,
      importing: false,
      currentDate: action.hasOwnProperty('date') ? action.date : null,
      photos: action.photos.map(function(photo) {
        photo.versionNumber = 1;

        if (photo.hasOwnProperty('versions') && photo.versions.length > 0) {
          photo.versionNumber = 1 + photo.versions.length;

          let lastVersion = photo.versions[photo.versions.length - 1];

          photo.thumb = lastVersion.output;
          photo.thumb_250 = lastVersion.thumbnail;
        }

        return photo;
      })
    };

  case 'UPDATED_PHOTO_SUCCESS':
    return {
      ...state,
      photos: updatePhotos(state.photos, action.photo)
    };

  case 'GET_DATES_SUCCESS':
    return {
      ...state,
      dates: processDates(action.dates)
    };

  case 'SET_IMPORT':
    return {
      ...state,
      importing: action.status
    };

  case 'SET_IMPORT_PROGRESS':
    return {
      ...state,
      progress: action.progress
    };

  default:
    return state;
  }
}
