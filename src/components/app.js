import keymapManager from './../keymap-manager';
import * as React from 'react'
import { Provider } from 'react-redux';

import Ansel from './main/Ansel'

import store from './../store';

export default class App extends React.Component {
  componentDidMount() {
    keymapManager.bind(document.body);
  }

  componentWillUnmount() {
    keymapManager.unbind();
  }

  render() {
    return (
      <Provider store={store}>
        <Ansel />
      </Provider>
    );
  }
}
