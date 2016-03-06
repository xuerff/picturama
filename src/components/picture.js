import classNames from 'classnames';
import React from 'react';

var rotation = {};
rotation[1] = '';
rotation[0] = 'minus-ninety';

class Picture extends React.Component {
  static propTypes = {
    setCurrent: React.PropTypes.func.isRequired,
    setHighlight: React.PropTypes.func.isRequired,
    highlighted: React.PropTypes.array.isRequired,
    photo: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    thumb_250: React.PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);
  }

  handleDblClick() {
    this.props.setCurrent(this.props.index);
  }

  handleClick() {
    console.log('picture props', this.props, this.key);
    this.props.setHighlight(this.props.index);
  }

  render() {
    let photo = this.props.photo;

    let anchorClass = classNames(
      'picture',
      'card',
      { 'highlighted': this.props.highlighted }
    );

    let imgClass = classNames(
      rotation[photo.orientation],
      'shadow--2dp'
    );

    return (
      <a
        className={anchorClass}
        onDoubleClick={this.handleDblClick.bind(this)}>
        <span className="v-align"></span>
        <img
          onClick={this.handleClick.bind(this)}
          src={photo.thumb_250} 
          className={imgClass} />
      </a>
    );
  }
}

export default Picture;
