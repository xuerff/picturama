import processDates from './../lib/process-dates';

const initialState = {
  importing: false,
  currentDate: null,
  photos: [],
  dates: { years: [] }
};

export default function reducers(state = initialState, action) {
  switch (action.type) {
  case 'GET_PHOTOS_SUCCESS':
    return {
      ...state,
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

  default:
    return state;
  }
}
