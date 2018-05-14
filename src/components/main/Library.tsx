import * as React from 'react'
import { connect } from 'react-redux';

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
  current: number
}

interface State {
  scrollTop: number
}

class Library extends React.Component<Props, State> {

  constructor(props) {
    super(props);

    this.state = { scrollTop: 0 }
  }

  componentDidUpdate() {
    let state = this.state;
    if (this.props.current === -1 && state.scrollTop > 0) {
      this.props.setScrollTop(state.scrollTop);
      this.setState({ scrollTop: 0 });
    }
  }

  componentDidMount() {
    this.props.actions.getPhotos();
  }

  render() {
    const props = this.props

    let currentView;

    if (!props.photos || props.photos.length === 0) {
      currentView = <ReadyToScan />;
    } else {
      currentView =
        <Grid
          isActive={props.isActive}
          actions={props.actions}
        />
    }

    return (
      <div id="library" ref="library">
        {currentView}
      </div>
    );
  }
}

const ReduxLibrary = connect<Props, {}, ConnectProps, AppState>((state, props) => ({
  ...props,
  photos: state.photos,
  current: state.current
}))(Library);

export default ReduxLibrary;
