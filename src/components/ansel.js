var React = require('react');
var Sidebar = require('./sidebar');
var Container = require('./container');

var Ansel = React.createClass({
  render: function() {
    return (
      <div id="ansel">
        <Sidebar />
        <Container />
      </div>
    );
  }
});

module.exports = Ansel;
