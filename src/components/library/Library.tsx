import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux';

import ReadyToScan from '../ready-to-scan'
import LibraryTopBar from './LibraryTopBar'
import LibraryBottomBar from './LibraryBottomBar'
import Grid from './Grid'
import { PhotoType } from '../../models/photo'
import AppState, { Route } from '../../reducers/AppState'


interface ConnectProps {
    className?: any
    isActive: boolean
    actions: any
    setScrollTop: (scrollTop: number) => void
}

interface Props extends ConnectProps {
    currentDate: string | null
    showOnlyFlagged: boolean
    isShowingTrash: boolean
    current: number
    highlighted: number[]
    photos: PhotoType[]
    photosCount: number
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
            <div ref="library" className={classNames(props.className, 'Library')}>
                <LibraryTopBar
                    className="Library-topBar"
                    currentDate={props.currentDate}
                    showOnlyFlagged={props.showOnlyFlagged}
                    isShowingTrash={props.isShowingTrash}
                    actions={props.actions}
                />
                <div className="Library-body">
                    {currentView}
                </div>
                <LibraryBottomBar
                    className="Library-bottomBar"
                    highlighted={props.highlighted}
                    photosCount={props.photosCount}
                    actions={props.actions}
                />
            </div>
        );
    }
}

const ReduxLibrary = connect<Props, {}, ConnectProps, AppState>((state, props) => ({
    ...props,
    currentDate: state.currentDate,
    showOnlyFlagged: state.showOnlyFlagged,
    isShowingTrash: state.route === 'trash',
    current: state.current,
    photos: state.photos,
    photosCount: state.photosCount,
    highlighted: state.highlighted
}))(Library);

export default ReduxLibrary;
