import * as React from 'react'
import * as classNames from 'classnames'
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types'

import BottomBar from './BottomBar'
import Library from './Library'
import Settings from '../settings'
import Progress from '../progress'

class Container extends React.Component {
  static propTypes = {
    current: PropTypes.number,
    className: PropTypes.string.isRequired,
    actions: PropTypes.object.isRequired,
    settingsExists: PropTypes.bool.isRequired,
    importing: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props);

    this.state = { scrollTop: 0, isImporting: false };
  }

  handleScrollTop(scrollTop) {
    this.refs.container.scrollTop = scrollTop;
  }

  handleImport(store) {
    let state = this.state;

    state.isImporting = store.importing;
    this.setState(state);
  }

  componentDidMount() {
    this.props.actions.areSettingsExisting();
  }

  render() {
    let containerClass = classNames(this.props.className, {
      'bottom-bar-present': this.props.current === -1 && this.props.settingsExists
    });

    let content
    if (this.props.importing) {
      content = <Progress />
    } else if (!this.props.settingsExists) {
      content = <Settings actions={this.props.actions} />
    } else {
      content =
        <Library
          actions={this.props.actions}
          setScrollTop={this.handleScrollTop.bind(this)}
        />
    }

    return (
      <div id="container" ref="container" className={containerClass}>
        {content}
        {this.props.current === -1 && this.props.settingsExists ?
            <BottomBar actions={this.props.actions} />
        : ''}
      </div>
    );
  }
}

export default connect(state => ({
  current: state.current
}))(Container);
