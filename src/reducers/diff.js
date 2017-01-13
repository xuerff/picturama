export default function reducers(state, action) {
  switch (action.type) {
  case 'TOGGLE_DIFF_SUCCESS':
    return {
      ...state,
      diff: !state.diff
    };

  default:
    return state;
  }
}
