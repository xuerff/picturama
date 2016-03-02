import fs from 'fs';
import React from 'react';
//import { connect } from 'react-redux';
//import { bindActionCreators } from 'redux';

//import * as action from './../actions';

import Library from './library';
import Settings from './settings';
import Progress from './progress';

import config from './../config';

export default class Container extends React.Component {
  static propTypes = {
    className: React.PropTypes.string.isRequired,
    actions: React.PropTypes.object.isRequired,
    dispatch: React.PropTypes.func.isRequired,
    photos: React.PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);

    this.areSettingsExisting = this.areSettingsExisting.bind(this);

    this.state = { settingsExists: false, scrollTop: 0, isImporting: false };
  }

  handleScrollTop(scrollTop) {
    this.refs.container.scrollTop = scrollTop;
  }

  areSettingsExisting() {
    let state = this.state;
    state.settingsExists = fs.existsSync(config.settings);
    this.setState(state);
  }

  handleImport(store) {
    let state = this.state;
    state.isImporting = store.importing;
    this.setState(state);
  }

  componentDidMount() {
    this.areSettingsExisting();
  }

  render() {
    let content = <Settings setSavedFile={this.areSettingsExisting}/>;

    if (this.state.settingsExists)
      content = (
        <Library 
          actions={this.props.actions}
          photos={this.props.photos}
          setScrollTop={this.handleScrollTop.bind(this)}/>
      );

    if (this.state.isImporting)
      content = <Progress />;

    return (
      <div id="container" ref="container" className={this.props.className}>
        {content}
      </div>
    );
  }
}

//const ReduxContainer = connect(state => ({
//  photos: state.photos
//}))(Container);

//export default ReduxContainer;
