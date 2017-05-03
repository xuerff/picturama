const moveHighlight = (state, direction, event) => {
  let currentPos = state.highlighted[0];
  let gridWidth = event.target.getBoundingClientRect().width;
  let elWidth = event.target.children[0].getBoundingClientRect().width;
  let jumpSize = gridWidth / elWidth;

  if (direction === 'left' && currentPos - 1 >= 0)
    currentPos--;

  else if (direction === 'right' && currentPos + 1 < state.photos.length)
    currentPos++;

  else if (direction === 'up' && currentPos - jumpSize > 0)
    currentPos -= jumpSize;

  else if (direction === 'down' && currentPos + jumpSize < state.photos.length)
    currentPos += jumpSize;

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
        moveHighlight(state, action.direction, action.event)
      ]
    };

  case 'ADD_HIGHLIGHT_SUCCESS':
    return {
      ...state,
      highlighted: state.highlighted.concat(action.index)
    };

  case 'CLEAR_HIGHLIGHT_SUCCESS':
    return {
      ...state,
      highlighted: []
    };

  default:
    return state;
  }
}
