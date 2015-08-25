import React from 'react';

import remote from 'remote';
var Menu = remote.require('menu');
var MenuItem = remote.require('menu-item');

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

  contextMenu(e) {
    console.log('context menu', e);
    e.preventDefault()
    this.menu.popup(remote.getCurrentWindow());
  }

  shutterSpeed(exposureTime) {
    var zeros = -Math.floor( Math.log(exposureTime) / Math.log(10));
    return '1/' + Math.pow(10, zeros);
  }

  componentDidMount() {
    //var setCurrent = this.props.setCurrent;
    //var setLeft = this.props.setLeft;
    //var setRight = this.props.setRight;

    this.menu = new Menu();
    this.menu.append(new MenuItem({ label: 'Quit', click: function(e) {
      console.log('click')
    } }));

    document.addEventListener('keyup', this.keyboardListener.bind(this));
    document.addEventListener('contextmenu', this.contextMenu.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.keyboardListener.bind(this));
  }

  render() {
    console.log('photo', this.props.photo);
    return (
      <div className="picture-detail">
        <img
          src={this.props.photo.thumb} 
          width="90%"
          className={rotation[this.props.photo.orientation]} />

        <h3>{this.props.photo.title}</h3>

        <p>
          ISO: {this.props.photo.iso} - 
          f/{this.props.photo.aperture} @ {this.shutterSpeed(this.props.photo.exposure_time)}
        </p>
      </div>
    );
  }
}

export default PictureDetail;
