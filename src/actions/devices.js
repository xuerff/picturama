export const initDevices = (e, devices) => {
  return (dispatch) => {
    dispatch({ type: 'INIT_DEVICES_SUCCESS', devices });
  };
};

export const addDevice = (e, device) => {
  return (dispatch) => {
    dispatch({ type: 'ADD_DEVICE_SUCCESS', device });
  };
};

export const removeDevice = (e, device) => {
  console.log('action rm device', device);
  return (dispatch) => {
    dispatch({ type: 'REMOVE_DEVICE_SUCCESS', device });
  };
};

