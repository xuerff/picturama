'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

import Ansel from './../dist/components/ansel';

//ReactDOM.render(<Ansel />, document.getElementById('app'));
ReactDOM.render(React.createElement(Ansel), document.getElementById('app'));
