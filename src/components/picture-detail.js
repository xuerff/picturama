import React from 'react';

var rotation = {};
rotation[1] = '';
rotation[8] = 'minus-ninety';

class PictureDetail extends React.Component {
  constructor(props) {
    super(props);
  }

  keyboardListener(e) {
    if (e.keyCode == 27) // escape
      this.props.setCurrent(null);

    else if (e.keyCode == 37) // Left
      this.props.setLeft();

    else if (e.keyCode == 39) // Left
      this.props.setRight();
  }

  componentDidMount() {
    var setCurrent = this.props.setCurrent;
    var setLeft = this.props.setLeft;
    var setRight = this.props.setRight;

    document.addEventListener('keyup', this.keyboardListener.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.keyboardListener.bind(this));
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
