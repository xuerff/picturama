export default function reducers(state, action) {
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
}
