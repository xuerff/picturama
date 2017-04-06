export const startImport = () => dispatch => {
  dispatch({ type: 'SET_IMPORT', status: true });
};

export const importProgress = (e, progress) => dispatch => {
  dispatch({ type: 'SET_IMPORT_PROGRESS', progress });
};

