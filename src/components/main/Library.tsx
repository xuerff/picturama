import * as React from 'react'
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import * as PropTypes from 'prop-types'

import Export from '../export'
import ReadyToScan from '../ready-to-scan'
import Grid from '../grid/Grid'
import { PhotoType } from '../../models/photo'
import AppState from '../../reducers/AppState'


interface ConnectProps {
  isActive: boolean
  actions: any
  setScrollTop: (scrollTop: number) => void
}

interface Props extends ConnectProps {
  photos: PhotoType[],
  current: number,
  highlighted: number[]
}

interface State {
  scrollTop: number
  modal: 'none' | 'export'
  photosToExport?: PhotoType[]
}

class Library extends React.Component<Props, State> {
  static propTypes = {
    highlighted: PropTypes.array.isRequired,
    setScrollTop: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    current: PropTypes.number,
    photos: PropTypes.array.isRequired
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

  handleExport() {
    this.unbindEventListeners();
    let props = this.props

    this.setState({
      modal: 'export',
      photosToExport: props.photos
        .filter((photo, i) => props.highlighted.indexOf(i) !== -1)
    })
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
      this.setState({ scrollTop: 0 });
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

  closeDialog() {
    this.bindEventListeners();
    this.setState({ modal: 'none' })
  }

  render() {
    const props = this.props

    let currentView;
    let showModal;

    if (this.state.modal === 'export') {
      showModal = <Export
        photos={this.state.photosToExport}
        actions={props.actions}
        closeExportDialog={this.closeDialog} />;
    }

    if (!props.photos || props.photos.length === 0) {
      currentView = <ReadyToScan />;
    } else {
      currentView =
        <Grid
          isActive={props.isActive && !showModal}
          actions={props.actions}
          setExport={this.handleExport}
        />
    }

    return (
      <div id="library" ref="library">
        {currentView}
        {showModal}
      </div>
    );
  }
}

const ReduxLibrary = connect<Props, {}, ConnectProps, AppState>((state, props) => ({
  ...props,
  photos: state.photos,
  current: state.current,
  highlighted: state.highlighted
}))(Library);

export default ReduxLibrary;
