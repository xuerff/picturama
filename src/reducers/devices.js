const rmDevice = (devices, rmDevice) => {
  let pos = -1;

  devices.forEach((device, index) => {
    if (device.id == rmDevice.id)
      pos = index;
  });

  return [
    ...devices.slice(0, pos),
    ...devices.slice(pos + 1)
  ];
};

const initialState = {
  devices: []
};

export default (state = initialState, action) => {
  switch (action.type) {
  case 'INIT_DEVICES_SUCCESS':
    return {
      ...state,
      devices: action.devices
    };

  case 'ADD_DEVICE_SUCCESS':
    return {
      ...state,
      devices: [
        ...state.devices,
        action.device
      ]
    };

  case 'REMOVE_DEVICE_SUCCESS':
    return {
      ...state,
      devices: rmDevice(state.devices, action.device)
    };

  default:
    return state;
  }
};
