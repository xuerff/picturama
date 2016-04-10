import keymapManager from './../keymap-manager';
import React from 'react';
import { Provider } from 'react-redux';

import Ansel from './ansel';

import store from './../store';

export default class App extends React.Component {
  componentDidMount() {
    //let keymaps = new KeymapManager();
    //keymaps.defaultTarget = document.body;
    //keymaps.loadKeymap(`${__dirname}/../../keymaps/linux.json`);

    //document.addEventListener('keydown', function(event) {
    //  keymaps.handleKeyboardEvent(event);
    //});

    keymapManager.bind(document.body);
  }

  componentWillUnmount() {
    keymapManager.unbind();
  }

  render() {
    return(
      <Provider store={store}>
        <Ansel />
      </Provider>
    );
  }
}
