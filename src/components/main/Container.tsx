import * as classNames from 'classnames'
import * as React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types'

import Library from '../library/Library'
import Settings from '../settings'
import Progress from '../progress'
import AppState from '../../reducers/AppState'


interface ConnectProps {
  className?: any
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
    const containerElem = findDOMNode(this.refs.container) as HTMLElement
    containerElem.scrollTop = scrollTop
  }

  handleImport(store) {
    this.setState({ isImporting: store.importing })
  }

  componentDidMount() {
    this.props.actions.areSettingsExisting();
  }

  render() {
    const props = this.props

    let content
    if (props.importing) {
      content = <Progress />
    } else if (!props.settingsExists) {
      content = <Settings actions={props.actions} />
    } else {
      content =
        <Library
          className="Container-body"
          isActive={props.isActive}
          actions={props.actions}
          setScrollTop={this.handleScrollTop.bind(this)}
        />
    }

    return (
      <div ref="container" className={classNames(props.className, 'Container')}>
        {content}
      </div>
    );
  }
}

export default connect<Props, {}, ConnectProps, AppState>((state, props) => ({
  ...props,
  current: state.current
}))(Container);
