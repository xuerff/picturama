export default function reducers(state, action) {
  switch (action.type) {
  case 'SET_CURRENT_SUCCESS':
    return {
      ...state,
      diff: false,
      current: action.current <= state.photos.length && action.current >= 0 ? action.current : -1
    };

  case 'SET_CURRENT_LEFT_SUCCESS':
    return {
      ...state,
      diff: false,
      current: state.current >= 1 ? state.current - 1 : state.current
    };

  case 'SET_CURRENT_RIGHT_SUCCESS':
    return {
      ...state,
      diff: false,
      current: state.photos.length > state.current + 1 ? state.current + 1 : state.current
    };

  default:
    return state;
  }
}
