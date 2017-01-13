import processDates from './../lib/process-dates';
//import initialState from './../initial-state.js';

const initialState = {
  dates: {
    years: []
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
  case 'GET_DATES_SUCCESS':
    return {
      ...state,
      dates: processDates(action.dates)
    };

  //case 'SET_IMPORT':
  //  return {
  //    ...state,
  //    importing: action.status
  //  };

  //case 'SET_IMPORT_PROGRESS':
  //  return {
  //    ...state,
  //    progress: action.progress
  //  };

  //case 'ADD_DEVICE_SUCCESS':
  //  return {
  //    ...state,
  //    devices: [
  //      ...state.devices,
  //      action.device
  //    ]
  //  };

  //case 'REMOVE_DEVICE_SUCCESS':
  //  return {
  //    ...state,
  //    devices: rmDevice(state.devices, action.device)
  //  };

  //case 'SET_CURRENT_SUCCESS':
  //  return {
  //    ...state,
  //    diff: false,
  //    current: (action.current <= state.photos.length && action.current >= 0) ? action.current : -1
  //  };

  //case 'SET_CURRENT_LEFT_SUCCESS':
  //  return {
  //    ...state,
  //    diff: false,
  //    current: (state.current >= 1) ? state.current -1 : state.current
  //  };

  //case 'SET_CURRENT_RIGHT_SUCCESS':
  //  return {
  //    ...state,
  //    diff: false,
  //    current: (state.photos.length > state.current+1) ? state.current+1 : state.current
  //  };

  //case 'TOGGLE_DIFF_SUCCESS':
  //  return {
  //    ...state,
  //    diff: !state.diff
  //  };

  //case 'SETTINGS_EXISTS_SUCCESS':
  //  return {
  //    ...state,
  //    settingsExists: true
  //  };

  //case 'SETTINGS_EXISTS_ERROR':
  //  return {
  //    ...state,
  //    splashed: true,
  //    settingsExists: false
  //  };

  default:
    return state;
  }
};
