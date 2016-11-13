import { combineReducers } from 'redux';

import photos from './photos';
import dates from './dates';

//import processDates from './../lib/process-dates';
//import updatePhotos from './../lib/update-photos';

//const processTags = (prevTags, nextTags) => {
//  let tags = nextTags.map((nextTag) => {
//    let exists = false;

//    prevTags.forEach((prevTag) => {
//      if (nextTag.slug == prevTag.slug)
//        exists = true;
//    });

//    return (!exists) ? nextTag : null;
//  })
//  .filter((tag) => tag);

//  return (tags.length > 0) ? prevTags.concat(tags) : [];
//};

//const rmDevice = (devices, rmDevice) => {
//  let pos = -1;

//  devices.forEach((device, index) => {
//    if (device.id == rmDevice.id)
//      pos = index;
//  });

//  return [
//    ...devices.slice(0, pos),
//    ...devices.slice(pos + 1)
//  ];
//};

//const initialState = {
//  splashed: false,
//  importing: false,
//  currentDate: null,
//  currentTag: null,
//  showOnlyFlagged: false,
//  current: -1,
//  diff: false,
//  settingsExists: false,
//  photos: [],
//  tags: [],
//  devices: [],
//  dates: { years: [] },
//  progress: { processed: 0, total: 0 }
//};

export default combineReducers({
  photos,
  dates
});

//export default function reducers(state = initialState, action) {
//  switch (action.type) {
//  //case 'GET_PHOTOS_SUCCESS':
//  //  return {
//  //    ...state,
//  //    diff: false,
//  //    current: -1,
//  //    importing: false,
//  //    splashed: true,
//  //    currentDate: action.hasOwnProperty('date') ? action.date : state.currentDate,
//  //    currentTag: action.hasOwnProperty('tagId') ? action.tagId : state.currentTag,
//  //    showOnlyFlagged: action.hasOwnProperty('showOnlyFlagged') ? action.showOnlyFlagged : state.showOnlyFlagged,
//  //    photos: action.photos.map((photo) => {
//  //      photo.versionNumber = 1;

//  //      if (photo.hasOwnProperty('versions') && photo.versions.length > 0) {
//  //        photo.versionNumber = 1 + photo.versions.length;

//  //        let lastVersion = photo.versions[photo.versions.length - 1];

//  //        photo.thumb = lastVersion.output;
//  //        photo.thumb_250 = lastVersion.thumbnail;
//  //      }

//  //      return photo;
//  //    })
//  //  };

//  //case 'UPDATED_PHOTO_SUCCESS':
//  //  return {
//  //    ...state,
//  //    photos: updatePhotos(state.photos, action.photo)
//  //  };

//  case 'GET_DATES_SUCCESS':
//    return {
//      ...state,
//      dates: processDates(action.dates)
//    };

//  case 'SET_IMPORT':
//    return {
//      ...state,
//      importing: action.status
//    };

//  case 'SET_IMPORT_PROGRESS':
//    return {
//      ...state,
//      progress: action.progress
//    };

//  case 'GET_TAGS_SUCCESS':
//    return {
//      ...state,
//      tags: action.tags
//    };

//  case 'CREATE_TAGS_SUCCESS':
//    return {
//      ...state,
//      tags: processTags(state.tags, action.tags)
//    };

//  case 'INIT_DEVICES_SUCCESS':
//    return {
//      ...state,
//      devices: action.devices
//    };

//  case 'ADD_DEVICE_SUCCESS':
//    return {
//      ...state,
//      devices: [
//        ...state.devices,
//        action.device
//      ]
//    };

//  case 'REMOVE_DEVICE_SUCCESS':
//    return {
//      ...state,
//      devices: rmDevice(state.devices, action.device)
//    };

//  case 'SET_CURRENT_SUCCESS':
//    return {
//      ...state,
//      diff: false,
//      current: (action.current <= state.photos.length && action.current >= 0) ? action.current : -1
//    };

//  case 'SET_CURRENT_LEFT_SUCCESS':
//    return {
//      ...state,
//      diff: false,
//      current: (state.current >= 1) ? state.current -1 : state.current
//    };

//  case 'SET_CURRENT_RIGHT_SUCCESS':
//    return {
//      ...state,
//      diff: false,
//      current: (state.photos.length > state.current+1) ? state.current+1 : state.current
//    };

//  case 'TOGGLE_DIFF_SUCCESS':
//    return {
//      ...state,
//      diff: !state.diff
//    };

//  case 'SETTINGS_EXISTS_SUCCESS':
//    return {
//      ...state,
//      settingsExists: true
//    };

//  case 'SETTINGS_EXISTS_ERROR':
//    return {
//      ...state,
//      splashed: true,
//      settingsExists: false
//    };

//  default:
//    return state;
//  }
//}
