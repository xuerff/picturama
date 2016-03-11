import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';

import reducers from './reducers';

const enhancer = compose(
  applyMiddleware(thunk)
);

const store = createStore(reducers, enhancer);

export default store;
