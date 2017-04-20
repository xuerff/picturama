export const moveHightlightLeft = highlighted => dispatch => {
  let currentPos = highlighted[0];
  let newHighlighted = [];

  if (currentPos + 1 < this.props.photos.length)
    newHighlighted = [ currentPos + 1 ];

  dispatch({
    type: 'MOVE_HIGHLIGHT_SUCCESS',
    highlighted: newHighlighted
  });
};

export const setHighlight = (index, ctrlKey) => dispatch => {
  dispatch({
    type: ctrlKey ? 'ADD_HIGHLIGHT_SUCCESS' : 'MOVE_HIGHLIGHT_SUCCESS',
    index
  });
};
