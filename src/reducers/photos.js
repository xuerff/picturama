const initialState = [{}];

export default function photos(state = initialState, action) {
  switch (action.type) {
  case 'GET_PHOTOS_SUCCESS':
    return action.photos;

  default:
    return state;
  }
}
