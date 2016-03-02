const initialState = [{}];

export default function photos(state = initialState, action) {
  switch (action.type) {
  case 'GET_PHOTOS':
    console.log('reducer got photo', action);
    return action.photos;

  default:
    return state;
  }
}
