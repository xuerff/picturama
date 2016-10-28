import React from 'react';

class Header extends React.Component {
  static propTypes = {
    className: React.PropTypes.string.isRequired
  }

  //constructor(props) {
  //  super(props);

  //  this
  //}
  showSidebar() {
    window.dispatchEvent(new Event('core:toggleSidebar'));
  }

  render() {
    return (
      <header className={this.props.className} id="top-bar">
        <button onClick={this.showSidebar.bind(this)}>
          <i className="fa fa-bars" aria-hidden="true"></i>
        </button>
      </header>
    );
  }
}

export default Header;
