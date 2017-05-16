import React from 'react';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';

import PictureDetail from './picture-detail';
import PictureDiff from './picture-diff';
import Export from './export';
import ReadyToScan from './ready-to-scan';
import Grid from './grid';

class Library extends React.Component {
  static propTypes = {
    highlighted: React.PropTypes.array.isRequired,
    setScrollTop: React.PropTypes.func.isRequired,
    actions: React.PropTypes.object.isRequired,
    current: React.PropTypes.number,
    diff: React.PropTypes.bool.isRequired,
    photos: React.PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);

    this.bindEventListeners = this.bindEventListeners.bind(this);
    this.unbindEventListeners = this.unbindEventListeners.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.handleExport = this.handleExport.bind(this);
    this.activateExportAccelerator = this.activateExportAccelerator.bind(this);
    this.deactivateExportAccelerator = this.deactivateExportAccelerator.bind(this);

    this.state = { scrollTop: 0, modal: 'none' };
  }

  handleFlag() {
    this.props.actions.toggleFlag(this.props.photos[this.props.current]);
  }

  handleExport() {
    this.unbindEventListeners();
    let state = this.state;

    state.modal = 'export';
    state.photosToExport = this.props.photos
      .filter((photo, i) => this.props.highlighted.indexOf(i) !== -1);

    this.setState(state);
  }

  activateExportAccelerator() {
    ipcRenderer.send('toggleExportMenu', true);
    ipcRenderer.on('exportClicked', this.handleExport.bind(this));
  }

  deactivateExportAccelerator() {
    ipcRenderer.send('toggleExportMenu', false);
    ipcRenderer.removeAllListeners('exportClicked');
  }

  componentDidUpdate() {
    let state = this.state;

    if (this.props.current !== -1 || this.state.modal !== 'none')
      this.deactivateExportAccelerator();

    else if (this.props.highlighted.length > 0)
      this.activateExportAccelerator();

    if (this.props.current === -1 && state.scrollTop > 0) {
      this.props.setScrollTop(state.scrollTop);
      state.scrollTop = 0;
      this.setState(state);
    }
  }

  bindEventListeners() {
    if (this.props.highlighted.length > 0)
      this.activateExportAccelerator();
  }

  unbindEventListeners() {
    this.deactivateExportAccelerator();
  }

  componentDidMount() {
    this.props.actions.getPhotos();
    this.bindEventListeners();
  }

  componentWillUnmount() {
    this.unbindEventListeners();
  }

  isLast() {
    let photos = this.props.photos;

    if (photos.length === photos.indexOf(this.props.current) + 1)
      return true;

    if (photos.indexOf(this.props.current) === 0)
      return true;

    return false;
  }

  closeDialog() {
    this.bindEventListeners();

    let state = this.state;

    state.modal = 'none';
    this.setState(state);
  }

  render() {
    let currentView;
    let showModal;

    if (this.state.modal === 'export') {
      showModal = <Export
        photos={this.state.photosToExport}
        actions={this.props.actions}
        closeExportDialog={this.closeDialog} />;
    }

    if (!this.props.photos || this.props.photos.length === 0)
      currentView = <ReadyToScan />;

    else if (this.props.current === -1) {
      currentView = <Grid
                      actions={this.props.actions}
                      setScrollTop={this.props.setScrollTop}
                      setExport={this.handleExport}
                      photos={this.props.photos}/>;
    } else if (this.props.diff) {
      currentView = <PictureDiff
                      actions={this.props.actions}
                      photo={this.props.photos[this.props.current]} />;
    } else {
      currentView = <PictureDetail
                      photo={this.props.photos[this.props.current]}
                      actions={this.props.actions}
                      toggleFlag={this.handleFlag.bind(this)}
                      isLast={this.isLast.bind(this)} />;
    }

    return (
      <div id="library" ref="library">
        {currentView}
        {showModal}
      </div>
    );
  }
}

const ReduxLibrary = connect(state => ({
  photos: state.photos,
  current: state.current,
  diff: state.diff,
  highlighted: state.highlighted
}))(Library);

export default ReduxLibrary;
