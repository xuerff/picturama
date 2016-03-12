//import fs from 'fs';
import React from 'react';

import Library from './library';
import Settings from './settings';
import Progress from './progress';

//import config from './../config';

export default class Container extends React.Component {
  static propTypes = {
    className: React.PropTypes.string.isRequired,
    actions: React.PropTypes.object.isRequired,
    settingsExists: React.PropTypes.bool.isRequired,
    importing: React.PropTypes.bool.isRequired
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
    console.log('settings exists', this.props.settingsExists);

    let content = <Settings actions={this.props.actions} />;

    if (this.props.settingsExists)
      content = (
        <Library 
          actions={this.props.actions}
          setScrollTop={this.handleScrollTop.bind(this)}/>
      );

    if (this.props.importing)
      content = <Progress />;

    return (
      <div id="container" ref="container" className={this.props.className}>
        {content}
      </div>
    );
  }
}
