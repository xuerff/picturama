import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import { remote, ipcRenderer } from 'electron';

const dialog = remote.dialog;

class Header extends React.Component {
  static propTypes = {
    className: React.PropTypes.string.isRequired,
    currentTag: React.PropTypes.number,
    currentDate: React.PropTypes.string,
    route: React.PropTypes.string,
    showOnlyFlagged: React.PropTypes.bool.isRequired,
    actions: React.PropTypes.object.isRequired
  }

  showSidebar() {
    window.dispatchEvent(new Event('core:toggleSidebar'));
  }

  toggleFlagged() {
    console.log(this.props.currentDate, this.props.currentTag, this.props.showOnlyFlagged);

    this.props.actions.toggleFlagged(
      this.props.currentDate,
      !this.props.showOnlyFlagged
    );
  }

  deleteModal() {
    dialog.showMessageBox({
      type: 'question',
      message: 'Are you sure you want to empty the trash?',
      buttons: ['Move picture(s) to trash', 'Cancel']
    }, (index) => {
      if (index === 0)
        ipcRenderer.send('empty-trash', true);
    });
  }

  render() {
    let btnClass = classNames({
      'button': true,
      'flagged': true,
      'active': this.props.showOnlyFlagged
    });

    return (
      <header className={this.props.className} id="top-bar">
        <button onClick={this.showSidebar.bind(this)} id="hamburger">
          <i className="fa fa-bars" aria-hidden="true"></i>
        </button>

        <div className="pull-right">
          {this.props.route == 'trash' ? (
            <button
              onClick={this.deleteModal.bind(this)}
              className='button'>
              <i className="fa fa-trash" aria-hidden="true"></i>
            </button>
          ) : null}
          <button
            className={btnClass}
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
  currentDate: state.currentDate,
  showOnlyFlagged: state.showOnlyFlagged,
  route: state.route
}))(Header);

export default ReduxHeader;
export { Header };
