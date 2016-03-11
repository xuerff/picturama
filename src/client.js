'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

import App from './../dist/components/app';

if (process.env.ANSEL_DEV_MODE)
  document.title = 'Ansel - DEV MODE';

ReactDOM.render(React.createElement(App), document.getElementById('app'));
