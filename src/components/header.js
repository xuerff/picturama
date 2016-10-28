import React from 'react';
import { connect } from 'react-redux';

class Header extends React.Component {
  static propTypes = {
    className: React.PropTypes.string.isRequired,
    currentTag: React.PropTypes.number,
    currentDate: React.PropTypes.string,
    actions: React.PropTypes.object.isRequired
  }

  showSidebar() {
    window.dispatchEvent(new Event('core:toggleSidebar'));
  }

  toggleFlagged() {
    console.log(this.props.currentDate, this.props.currentTag);
    this.props.actions.toggleFlagged(this.props.currentDate);
  }

  render() {
    return (
      <header className={this.props.className} id="top-bar">
        <button onClick={this.showSidebar.bind(this)} id="hamburger">
          <i className="fa fa-bars" aria-hidden="true"></i>
        </button>

        <div className="pull-right">
          <button
            className="button flagged"
            onClick={this.toggleFlagged.bind(this)}>
            <i className="fa fa-flag" aria-hidden="true"></i>
          </button>
        </div>
      </header>
    );
  }
}

const ReduxHeader = connect(state => ({
  currentTag: state.currentTag,
  currentDate: state.currentDate
}))(Header);

export default ReduxHeader;
export { Header };
