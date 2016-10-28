import React from 'react';

class Header extends React.Component {
  static propTypes = {
    className: React.PropTypes.string.isRequired
  }

  render() {
    return (
      <header className={this.props.className} id="top-bar">
        <button>
          <i className="fa fa-bars" aria-hidden="true"></i>
        </button>
      </header>
    );
  }
}

export default Header;
