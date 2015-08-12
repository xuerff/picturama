var React = require('react');

var rotation = {};
rotation[1] = '';
rotation[8] = 'minus-ninety';

var PictureDetail = React.createClass({
  componentDidMount: function() {
    var setCurrent = this.props.setCurrent;

    document.onkeyup = function(e) {
      if (e.keyCode == 27)
        setCurrent(null);
    };
  },

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
