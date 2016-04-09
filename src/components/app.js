import KeymapManager from 'atom-keymap';
import React from 'react';
import { Provider } from 'react-redux';

import Ansel from './ansel';

import store from './../store';

export default class App extends React.Component {
  componentDidMount() {
    let keymaps = new KeymapManager();
    keymaps.defaultTarget = document.body;
    console.log('dirname', __dirname);
    keymaps.loadKeymap(`${__dirname}/../../keymaps/linux.json`);

    document.addEventListener('keydown', function(event) {
      keymaps.handleKeyboardEvent(event);
    });
  }

  render() {
    return(
      <Provider store={store}>
        <Ansel />
      </Provider>
    );
  }
}
