export default function reducers(state, action) {
  switch (action.type) {
  case 'MOVE_HIGHLIGHT_SUCCESS':
    return {
      ...state,
      highlighted: [ action.index ]
    };

  case 'ADD_HIGHLIGHT_SUCCESS':
    return {
      ...state,
      highlighted: [
        ...state.hightlighted,
        action.index
      ]
    };

  default:
    return state;
  }
}
