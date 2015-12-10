import React from 'react';

var rotation = {};
rotation[1] = '';
rotation[8] = 'minus-ninety';

class Picture extends React.Component {

  constructor(props) {
    super(props);
    this.getImgClass = this.getImgClass.bind(this);
  }

  handleClick() {
    console.log('this', this);
    console.log('this props', this.props);
    this.props.setCurrent(this.props.photo);
  }

  getImgClass() {
    return [
      rotation[this.props.photo.orientation],
      'shadow--2dp'
    ].join(' ');
  }

  render() {
    return (
      <a className="picture card " onClick={this.handleClick.bind(this)}>
        <img
          src={this.props.photo.thumb_250} 
          className={this.getImgClass()} />
      </a>
    );
  }
}

export default Picture;
