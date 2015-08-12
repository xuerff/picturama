import React from 'react';

var rotation = {};
rotation[1] = '';
rotation[8] = 'minus-ninety';

class PictureDetail extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    var setCurrent = this.props.setCurrent;

    document.onkeyup = function(e) {
      if (e.keyCode == 27)
        setCurrent(null);
    };
  }

  render() {
    return (
      <div className="picture-detail">
        <img
          src={this.props.photo.thumb} 
          width="90%"
          className={rotation[this.props.photo.orientation]} />
      </div>
    );
  }
}

export default PictureDetail;
