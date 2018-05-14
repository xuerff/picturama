import { ipcRenderer } from 'electron';
import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux'

import * as actions from '../../actions'

import Export from '../export'
import PictureDetail from '../detail/PictureDetail'
import PictureDiff from '../picture-diff'
import Container from './Container'
import Sidebar from '../sidebar'
import AppState, { ModalType } from '../../reducers/AppState'
import { PhotoType, PhotoEffect, PhotoWork } from '../../models/Photo'
import { bindMany } from '../../util/LangUtil'


interface Props {
    dispatch: Dispatch<any>
    settingsExists: boolean
    current?: number
    highlighted: number[]
    currentPhotoWork?: PhotoWork
    photos: PhotoType[]
    modal: ModalType
    importing: boolean
    splashed: boolean
    isExportEnabled: boolean
}

interface State {
    showSidebar: boolean
    dateFilter?: void  // TODO
    actions: any
}

class Ansel extends React.Component<Props, State> {

  constructor(props) {
    super(props);

    this.state = {
      showSidebar: true,
      actions: bindActionCreators(actions, props.dispatch)
    };

    bindMany(this, 'toggleSidebar', 'handleFlag', 'handleDateFilter', 'setCurrentLeft', 'setCurrentRight', 'storeCurrentEffects')
  }

  handleDateFilter(date) {
    this.setState({ dateFilter: date });
  }

  componentDidUpdate(prevProps, prevState) {
    const props = this.props
    if (props.splashed === true) {
      let splash = document.getElementById('splash');
      if (splash) splash.parentNode.removeChild(splash);
    }
    if (props.isExportEnabled !== prevProps.isExportEnabled) {
      ipcRenderer.send('toggleExportMenu', props.isExportEnabled)
      if (props.isExportEnabled) {
        ipcRenderer.on('exportClicked', this.state.actions.openExport)
      } else {
        ipcRenderer.removeAllListeners('exportClicked')
      }
    }
  }

  componentDidMount() {
    ipcRenderer.on('start-import', this.state.actions.startImport);
    ipcRenderer.on('progress', this.state.actions.importProgress);

    ipcRenderer.on('finish-import', () => {
      this.state.actions.getPhotos();
      this.state.actions.getDates();
      this.state.actions.getTags();
    });

    ipcRenderer.on('new-version', this.state.actions.updatedPhoto);
    ipcRenderer.on('scanned-devices', this.state.actions.initDevices);
    ipcRenderer.on('add-device', this.state.actions.addDevice);
    ipcRenderer.on('remove-device', this.state.actions.removeDevice);
    ipcRenderer.on('photos-trashed', this.state.actions.removePhotos);

    window.addEventListener('core:toggleSidebar', this.toggleSidebar);
  }

  componentWillUnmount() {
    window.removeEventListener('core:toggleSidebar', this.toggleSidebar);
  }

  toggleSidebar() {
    this.setState({ showSidebar: !this.state.showSidebar })
  }

  handleFlag() {
    this.state.actions.toggleFlag(this.props.photos[this.props.current]);
  }

  setCurrentLeft() {
    const props = this.props
    if (props.current > 0) {
      this.state.actions.setCurrent(props.current - 1)
    }
  }

  setCurrentRight() {
    const props = this.props
    if (props.photos.length > props.current + 1) {
      this.state.actions.setCurrent(props.current + 1)
    }
  }

  storeCurrentEffects(effects: PhotoEffect[]) {
    const props = this.props
    const photo = props.photos[props.current]
    this.state.actions.storeEffects(photo, effects)
  }

  render() {
    const props = this.props
    const state = this.state

    let modalView
    if (props.modal === 'export') {
      modalView =
        <Export
          photos={props.photos.filter((photo, i) => props.highlighted.indexOf(i) !== -1)}
          actions={state.actions}
        />
    } else if (props.settingsExists && !props.importing && props.current !== -1) {
      if (props.modal === 'diff') {
        modalView =
          <PictureDiff
            className="Ansel-detail"
            actions={state.actions}
            photo={props.photos[props.current]}
          />
      } else {
        modalView =
          <PictureDetail
            className="Ansel-detail"
            photo={props.photos[props.current]}
            effects={props.currentPhotoWork && props.currentPhotoWork.effects}
            isFirst={props.current === 0}
            isLast={props.current === props.photos.length - 1}
            actions={state.actions}
            setCurrentLeft={this.setCurrentLeft}
            setCurrentRight={this.setCurrentRight}
            toggleFlag={this.handleFlag}
            storeEffects={this.storeCurrentEffects}
          />
      }
    }

    return (
      <div id="ansel" className={classNames('Ansel', { hasSidebar: props.settingsExists && state.showSidebar })}>
        <Sidebar
          className="Ansel-sidebar"
          actions={state.actions}
          setDateFilter={this.handleDateFilter} />

        <Container
          className="Ansel-container"
          isActive={!modalView}
          settingsExists={props.settingsExists}
          actions={state.actions}
          importing={props.importing}
        />

        {modalView}
      </div>
    );
  }
}

const ReduxAnsel = connect((state: AppState) => ({
  photos: state.photos,
  current: state.current,
  highlighted: state.highlighted,
  isExportEnabled: state.settingsExists && !state.importing && state.current === -1 && state.modal === null && state.highlighted.length > 0,
  currentPhotoWork: state.currentPhotoWork,
  modal: state.modal,
  importing: state.importing,
  splashed: state.splashed,
  settingsExists: state.settingsExists
}))(Ansel);

export default ReduxAnsel;
