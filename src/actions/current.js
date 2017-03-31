export const setCurrent = current => dispatch => {
  dispatch({ type: 'SET_CURRENT_SUCCESS', current });
};

export const setCurrentLeft = () => dispatch => {
  dispatch({ type: 'SET_CURRENT_LEFT_SUCCESS' });
};

export const setCurrentRight = () => dispatch => {
  dispatch({ type: 'SET_CURRENT_RIGHT_SUCCESS' });
};

