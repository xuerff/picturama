export const setCurrent = (current) => {
  return (dispatch) => {
    dispatch({ type: 'SET_CURRENT_SUCCESS', current });
  };
};

export const setCurrentLeft = () => {
  return (dispatch) => {
    dispatch({ type: 'SET_CURRENT_LEFT_SUCCESS' });
  };
};

export const setCurrentRight = () => {
  return (dispatch) => {
    dispatch({ type: 'SET_CURRENT_RIGHT_SUCCESS' });
  };
};

