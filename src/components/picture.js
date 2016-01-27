import React from 'react';

var rotation = {};
rotation[1] = '';
rotation[0] = 'minus-ninety';

class Picture extends React.Component {

  constructor(props) {
    super(props);
    this.getImgClass = this.getImgClass.bind(this);
  }

  handleDblClick() {
    console.log('this', this);
    console.log('this props', this.props);
    this.props.setCurrent(this.props.photo);
  }

  handleClick() {
    this.props.setHighlight(this.props.photo);
  }

  getImgClass() {
    let classes = [
      rotation[this.props.photo.orientation],
      'shadow--2dp'
    ];

    return classes.join(' ');
  }

  getAnchorClass() {
    let classes = [ 'picture', 'card' ];

    if (this.props.photo.highlighted)
      classes.push('highlighted');

    return classes.join(' ');
  }

  render() {
    return (
      <a
        className={this.getAnchorClass()}
        onDoubleClick={this.handleDblClick.bind(this)}>
        <img
          onClick={this.handleClick.bind(this)}
          src={this.props.photo.thumb_250} 
          className={this.getImgClass()} />
      </a>
    );
  }
}

export default Picture;
