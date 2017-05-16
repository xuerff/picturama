import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';

import reducers from './reducers';

let createLogger, enhancer, logger;

if (process.env.ANSEL_DEV_MODE) {
  createLogger = require('redux-logger');

  logger = createLogger();
  enhancer = compose(
    applyMiddleware(thunk, logger)
  );

} else {
  enhancer = compose(
    applyMiddleware(thunk)
  );
}

const store = createStore(reducers, enhancer);

export default store;
