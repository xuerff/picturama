import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';

import reducers from './reducers';

const enhancer = compose(
  applyMiddleware(thunk)
);

//const initialState = {
//  splashed: false,
//  importing: false,
//  currentDate: null,
//  currentTag: null,
//  showOnlyFlagged: false,
//  current: -1,
//  diff: false,
//  settingsExists: false,
//  photos: [],
//  tags: [],
//  devices: [],
//  dates: { years: [] },
//  progress: { processed: 0, total: 0 }
//};

const store = createStore(reducers, enhancer);

export default store;
