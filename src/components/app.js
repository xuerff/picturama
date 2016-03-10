import React from 'react';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';

//import DevTools from './dev-tools';
import Ansel from './ansel';

import reducers from './../reducers';

const enhancer = compose(
  // Middleware you want to use in development:
  applyMiddleware(thunk)
  // Required! Enable Redux DevTools with the monitors you chose
  //DevTools.instrument()
);

//const store = createStore(reducers, applyMiddleware(thunk));
const store = createStore(reducers, enhancer);

export default class App extends React.Component {
  render() {
    return(
      <Provider store={store}>
        <Ansel />
      </Provider>
    );
  }
}
