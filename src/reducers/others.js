import processDates from './../lib/process-dates';

const processTags = (prevTags, nextTags) => {
  let tags = nextTags.map((nextTag) => {
    let exists = false;

    prevTags.forEach((prevTag) => {
      if (nextTag.slug == prevTag.slug)
        exists = true;
    });

    return (!exists) ? nextTag : null;
  })
  .filter((tag) => tag);

  return (tags.length > 0) ? prevTags.concat(tags) : [];
};

const rmDevice = (devices, rmDevice) => {
  let pos = -1;

  devices.forEach((device, index) => {
    if (device.id == rmDevice.id)
      pos = index;
  });

  return [
    ...devices.slice(0, pos),
    ...devices.slice(pos + 1)
  ];
};

export default function reducers(state, action) {
  switch (action.type) {
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

  case 'GET_TAGS_SUCCESS':
    return {
      ...state,
      tags: action.tags
    };

  case 'CREATE_TAGS_SUCCESS':
    return {
      ...state,
      tags: processTags(state.tags, action.tags)
    };

  case 'INIT_DEVICES_SUCCESS':
    return {
      ...state,
      devices: action.devices
    };

  case 'ADD_DEVICE_SUCCESS':
    return {
      ...state,
      devices: [
        ...state.devices,
        action.device
      ]
    };

  case 'REMOVE_DEVICE_SUCCESS':
    return {
      ...state,
      devices: rmDevice(state.devices, action.device)
    };

  case 'SET_CURRENT_SUCCESS':
    return {
      ...state,
      diff: false,
      current: (action.current <= state.photos.length && action.current >= 0) ? action.current : -1
    };

  case 'SET_CURRENT_LEFT_SUCCESS':
    return {
      ...state,
      diff: false,
      current: (state.current >= 1) ? state.current -1 : state.current
    };

  case 'SET_CURRENT_RIGHT_SUCCESS':
    return {
      ...state,
      diff: false,
      current: (state.photos.length > state.current+1) ? state.current+1 : state.current
    };

  case 'TOGGLE_DIFF_SUCCESS':
    return {
      ...state,
      diff: !state.diff
    };

  case 'SETTINGS_EXISTS_SUCCESS':
    return {
      ...state,
      settingsExists: true
    };

  case 'SETTINGS_EXISTS_ERROR':
    return {
      ...state,
      splashed: true,
      settingsExists: false
    };

  default:
    return state;
  }
}

