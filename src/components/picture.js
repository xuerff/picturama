import classNames from 'classnames';
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
    this.props.setCurrent(this.props.photo);
  }

  handleClick() {
    this.props.setHighlight(this.props.photo);
  }

  render() {
    let anchorClass = classNames(
      'picture',
      'card',
      { 'highlighted': this.props.photo.highlighted }
    );

    let imgClass = classNames(
      rotation[this.props.photo.orientation],
      'shadow--2dp'
    );

    return (
      <a
        className={anchorClass}
        onDoubleClick={this.handleDblClick.bind(this)}>
        <img
          onClick={this.handleClick.bind(this)}
          src={this.props.photo.thumb_250} 
          className={imgClass} />
      </a>
    );
  }
}

export default Picture;
