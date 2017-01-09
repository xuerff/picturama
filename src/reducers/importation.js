const initialState = {
};

export default (state = initialState, action) => {
  switch (action.type) {
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
};
