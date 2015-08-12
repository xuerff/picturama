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
    var setLeft = this.props.setLeft;
    var setRight = this.props.setRight;

    document.onkeyup = function(e) {
      console.log('key code', e.keyCode);

      if (e.keyCode == 27) // escape
        setCurrent(null);

      else if (e.keyCode == 37) // Left
        setLeft();

      else if (e.keyCode == 39) // Left
        setRight();
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
