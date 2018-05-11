import { ipcRenderer } from 'electron';
import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux'

import * as action from '../../actions'

import PictureDetail from '../detail/PictureDetail'
import PictureDiff from '../picture-diff'
import Header from './Header'
import Container from './Container'
import Sidebar from '../sidebar'
import { DetailState } from '../../reducers/detail'
import AppState from '../../reducers/AppState'
import { PhotoType } from '../../models/Photo'


interface Props {
  dispatch: Dispatch<any>,
  settingsExists: boolean,
  current?: number,
  detail?: DetailState,
  photos: PhotoType[],
  diff: boolean,
  importing: boolean,
  splashed: boolean
}

interface State {
  showSidebar: boolean
  dateFilter?: any  // TODO
  actions: any
}

class Ansel extends React.Component<Props, State> {

  constructor(props) {
    super(props);

    this.state = {
      showSidebar: true,
      actions: bindActionCreators(action, this.props.dispatch)
    };

    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.handleFlag = this.handleFlag.bind(this)
    this.handleDateFilter = this.handleDateFilter.bind(this)
  }

  handleDateFilter(date) {
    this.setState({ dateFilter: date });
  }

  componentDidUpdate() {
    if (this.props.splashed === true) {
      let splash = document.getElementById('splash');
      if (splash) splash.parentNode.removeChild(splash);
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

  render() {
    const props = this.props
    const state = this.state

    let noSidebarClass = classNames({ 
      'no-sidebar': !state.showSidebar || !props.settingsExists
    });

    let detailView
    if (props.settingsExists && !props.importing && props.current !== -1) {
      if (props.diff) {
        detailView =
          <PictureDiff
            className="Ansel-detail"
            actions={state.actions}
            photo={props.photos[props.current]}
          />
      } else {
        detailView =
          <PictureDetail
            className="Ansel-detail"
            photo={props.photos[props.current]}
            effects={props.detail && props.detail.effects}
            isFirst={props.current === 0}
            isLast={props.current === props.photos.length - 1}
            actions={state.actions}
            toggleFlag={this.handleFlag}
          />
      }
    }

    const HeaderUntyped = Header as any
    const ContainerUntyped = Container as any

    return (
      <div id="ansel" className="Ansel">
        <Sidebar
          actions={state.actions}
          className={noSidebarClass}
          setDateFilter={this.handleDateFilter} />

        <HeaderUntyped
          actions={state.actions}
          className={noSidebarClass} />

        <ContainerUntyped
          settingsExists={props.settingsExists}
          actions={state.actions}
          importing={props.importing}
          className={noSidebarClass} />

        {detailView}
      </div>
    );
  }
}

const ReduxAnsel = connect((state: AppState) => ({
  photos: state.photos,
  current: state.current,
  detail: state.detail,
  diff: state.diff,
  importing: state.importing,
  splashed: state.splashed,
  settingsExists: state.settingsExists
}))(Ansel);

export default ReduxAnsel;
