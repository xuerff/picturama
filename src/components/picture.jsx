var React = require('react');

var Picture = React.createClass({
  render: function() {
    return (
      <div className="picture">
        <img src={this.props.photo.thumb} width="250px" />
      </div>
    );
  }
});

module.exports = Picture;
