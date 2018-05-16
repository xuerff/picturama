export const moveHighlightLeft = event => dispatch => {
  dispatch({
    type: 'MOVE_HIGHLIGHT_SUCCESS',
    direction: 'left',
    event
  });
};

export const moveHighlightRight = event => dispatch => {
  dispatch({
    type: 'MOVE_HIGHLIGHT_SUCCESS',
    direction: 'right',
    event
  });
};

export const moveHighlightUp = event => dispatch => {
  dispatch({
    type: 'MOVE_HIGHLIGHT_SUCCESS',
    direction: 'up',
    event
  });
};

export const moveHighlightDown = event => dispatch => {
  dispatch({
    type: 'MOVE_HIGHLIGHT_SUCCESS',
    direction: 'down',
    event
  });
};

export const setHighlight = (index, ctrlKey, metaKey) => dispatch => {
  const isMac = process.platform === 'darwin'
  dispatch({
    type: (isMac ? metaKey : ctrlKey) ? 'ADD_HIGHLIGHT_SUCCESS' : 'SET_HIGHLIGHT_SUCCESS',
    index
  });
};

export const clearHighlight = () => dispatch => {
  dispatch({ type: 'CLEAR_HIGHLIGHT_SUCCESS' });
};
