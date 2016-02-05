'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

import Ansel from './../dist/components/ansel';

if (process.env.ANSEL_DEV_MODE)
  document.title = 'Ansel - DEV MODE';

ReactDOM.render(React.createElement(Ansel), document.getElementById('app'));
