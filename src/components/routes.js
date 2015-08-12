import React from 'react';
//var Router = require('react-router'); // or var Router = ReactRouter; in browsers

import {Route, DefaultRoute} from 'react-router';
//var Route = Router.Route;
//var DefaultRoute = Router.DefaultRoute;

import Ansel from './ansel';
import Library from './library';

//var Ansel = require('./ansel');
//var Library = require('./library');

export default (
  <Route handler={Ansel}>
    <DefaultRoute handler={Library} />
  </Route>
);
