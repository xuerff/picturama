import * as classNames from 'classnames'
import * as React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types'

import BottomBar from './BottomBar'
import Library from './Library'
import Settings from '../settings'
import Progress from '../progress'
import AppState from '../../reducers/AppState'


interface ConnectProps {
  className: any
  isActive: boolean
  settingsExists: boolean
  importing: boolean
  actions: any
}

interface Props extends ConnectProps {
  current: number
}

interface State {
  scrollTop: 0
  isImporting: boolean
}

class Container extends React.Component<Props, State> {

  constructor(props) {
    super(props);

    this.state = { scrollTop: 0, isImporting: false };
  }

  handleScrollTop(scrollTop) {
    findDOMNode(this.refs.container).scrollTop = scrollTop
  }

  handleImport(store) {
    this.setState({ isImporting: store.importing })
  }

  componentDidMount() {
    this.props.actions.areSettingsExisting();
  }

  render() {
    const props = this.props

    let containerClass = classNames(props.className, {
      'bottom-bar-present': props.current === -1 && props.settingsExists
    });

    let content
    if (props.importing) {
      content = <Progress />
    } else if (!props.settingsExists) {
      content = <Settings actions={props.actions} />
    } else {
      content =
        <Library
          isActive={props.isActive}
          actions={props.actions}
          setScrollTop={this.handleScrollTop.bind(this)}
        />
    }

    return (
      <div id="container" ref="container" className={containerClass}>
        {content}
        {props.current === -1 && props.settingsExists ?
            <BottomBar actions={props.actions} />
        : ''}
      </div>
    );
  }
}

export default connect<Props, {}, ConnectProps, AppState>((state, props) => ({
  ...props,
  current: state.current
}))(Container);
