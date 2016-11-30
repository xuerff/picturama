export const startImport = () => {
  return (dispatch) => {
    dispatch({ type: 'SET_IMPORT', status: true });
  };
};

export const importProgress = (e, progress) => {
  return (dispatch) => {
    dispatch({ type: 'SET_IMPORT_PROGRESS', progress });
  };
};

