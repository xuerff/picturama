export const moveHighlightLeft = () => dispatch => {
  dispatch({
    type: 'MOVE_HIGHLIGHT_SUCCESS',
    direction: 'left'
  });
};

export const moveHighlightRight = () => dispatch => {
  dispatch({
    type: 'MOVE_HIGHLIGHT_SUCCESS',
    direction: 'right'
  });
};

export const setHighlight = (index, ctrlKey) => dispatch => {
  dispatch({
    type: ctrlKey ? 'ADD_HIGHLIGHT_SUCCESS' : 'SET_HIGHLIGHT_SUCCESS',
    index
  });
};
