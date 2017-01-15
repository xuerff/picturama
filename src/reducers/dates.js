import processDates from './../lib/process-dates';

export default function reducers(state, action) {
  switch (action.type) {
  case 'GET_DATES_SUCCESS':
    return {
      ...state,
      dates: processDates(action.dates)
    };

  default:
    return state;
  }
}
