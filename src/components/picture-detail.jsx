var React = require('react');

var rotation = {};
rotation[1] = '';
rotation[8] = 'minus-ninety';

var PictureDetail = React.createClass({
  render: function() {
    return (
      <div className="picture-detail">
        <img
          src={this.props.photo.thumb} 
          width="90%"
          className={rotation[this.props.photo.orientation]} />
      </div>
    );
  }
});

module.exports = PictureDetail;
