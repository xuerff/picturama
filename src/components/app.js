import React from 'react';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

import Ansel from './ansel';

import reducers from './../reducers';

const store = createStore(reducers, applyMiddleware(thunk));

export default class App extends React.Component {
  render() {
    return(
      <Provider store={store}>
        <Ansel />
      </Provider>
    );
  }
}
