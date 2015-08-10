var React = require('react');
var Sidebar = require('./sidebar.jsx');
var Container = require('./container.jsx');

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
