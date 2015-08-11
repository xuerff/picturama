var React = require('react');
var Router = require('react-router'); // or var Router = ReactRouter; in browsers

var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;

var Ansel = require('./ansel.jsx');
var Library = require('./library.jsx');

module.exports = (
  <Route handler={Ansel}>
    <DefaultRoute handler={Library} />
  </Route>
);
