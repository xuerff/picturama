import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import { createStore, applyMiddleware, compose } from 'redux';

import reducers from './reducers';


const logger = createLogger();
const enhancer = compose(
  applyMiddleware(thunk, logger)
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
