export const initDevices = (e, devices) => dispatch => {
  dispatch({ type: 'INIT_DEVICES_SUCCESS', devices });
};

export const addDevice = (e, device) => dispatch => {
  dispatch({ type: 'ADD_DEVICE_SUCCESS', device });
};

export const removeDevice = (e, device) => dispatch => {
  dispatch({ type: 'REMOVE_DEVICE_SUCCESS', device });
};
