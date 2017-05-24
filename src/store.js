import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';

import reducers from './reducers';

let enhancer, logger;

if (process.env.ANSEL_DEV_MODE) {
  logger = require('redux-logger').default;

  enhancer = applyMiddleware(thunk, logger);
} else
  enhancer = applyMiddleware(thunk);

const store = createStore(reducers, enhancer);

export default store;
