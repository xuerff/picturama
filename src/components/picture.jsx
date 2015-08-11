var React = require('react');

var rotation = {};
rotation[1] = '';
rotation[8] = 'minus-ninety';

var Picture = React.createClass({
  handleClick: function() {
    console.log('this props', this.props);
    this.props.setCurrent(this.props.photo);
  },

  render: function() {
    return (
      <a className="picture" onClick={this.handleClick}>
        <img
          src={this.props.photo.thumb} 
          width="250px" 
          className={rotation[this.props.photo.orientation]} />
      </a>
    );
  }
});

module.exports = Picture;
