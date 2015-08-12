var React = require('react');
var Library = require('./library');

var Container = React.createClass({
  render: function() {
    return (
      <div id="container">
        <Library />
      </div>
    );
  }
});

module.exports = Container
