const moveHighlight = (state, direction) => {
  let currentPos = state.highlighted[0];

  if (direction === 'left' && currentPos - 1 >= 0)
    currentPos--;

  else if (direction === 'right' && currentPos + 1 < state.photos.length)
    currentPos++;

  return currentPos;
};

export default function reducers(state, action) {
  switch (action.type) {
  case 'SET_HIGHLIGHT_SUCCESS':
    return {
      ...state,
      highlighted: [ action.index ]
    };

  case 'MOVE_HIGHLIGHT_SUCCESS':
    return {
      ...state,
      highlighted: [
        moveHighlight(state, action.direction)
      ]
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
