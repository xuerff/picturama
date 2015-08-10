'use strict';
require('node-jsx').install({ harmony: true, extension: '.jsx' });

(function() {
  var React = require('react');
  var Ansel = require('./components/ansel.jsx');

  React.render(
    React.createElement(Ansel, null),
    document.getElementById('app')
  );
})();
