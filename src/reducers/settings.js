const initialState = {
  splashed: false,
  settingsExists: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
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
};
