import React from 'react';

var rotation = {};
rotation[1] = '';
rotation[8] = 'minus-ninety';

class Picture extends React.Component {

  constructor(props) {
    super(props);
  }

  handleClick() {
    console.log('this', this);
    console.log('this props', this.props);
    this.props.setCurrent(this.props.photo);
  }

  render() {
    return (
      <a className="picture mdl-card mdl-shadow--2dp" onClick={this.handleClick.bind(this)}>
        <img
          src={this.props.photo.thumb} 
          className={rotation[this.props.photo.orientation]} />
      </a>
    );
  }
}

export default Picture;
