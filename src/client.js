'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

import App from './../dist/components/app';
import pkgs from './../package.json';

if (process.env.ANSEL_DEV_MODE)
  document.title = 'Ansel - DEV MODE';
else
  document.title = `Ansel - ${pkgs.version}`;

if (process.env.ANSEL_TEST_MODE)
  document.title = 'Ansel - TEST MODE';

ReactDOM.render(React.createElement(App), document.getElementById('app'));
