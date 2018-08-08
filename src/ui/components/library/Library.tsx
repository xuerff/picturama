import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'

import ReadyToScan from './ReadyToScan'
import LibraryTopBar from './LibraryTopBar'
import LibraryBottomBar from './LibraryBottomBar'
import Grid from './Grid'
import { setDetailPhotoById } from '../../data/DetailStore'
import { fetchPhotos, setPhotosFilter, updatePhotoWork, setPhotosFlagged } from '../../data/PhotoStore'
import { PhotoId, PhotoType, PhotoWork } from '../../../common/models/Photo'
import { setHighlightedPhotosAction, openExportAction } from '../../state/actions'
import { AppState } from '../../state/reducers'
import { PhotoData } from '../../state/reducers/library'
import store from '../../state/store'
import { bindMany } from '../../../common/util/LangUtil'


interface OwnProps {
    className?: any
    isActive: boolean
}

interface StateProps {
    photos: PhotoData
    photoIds: PhotoId[]
    photosCount: number
    highlightedPhotoIds: PhotoId[]
    showOnlyFlagged: boolean
    isShowingTrash: boolean
}

interface DispatchProps {
    fetchPhotos: () => void
    setHighlightedPhotos: (highlightedIds: PhotoId[]) => void
    setDetailPhotoById: (photoId: PhotoId) => void
    openExport: (photoIds: PhotoId[]) => void
    setPhotosFlagged: (photos: PhotoType[], flag: boolean) => void
    updatePhotoWork: (photo: PhotoType, update: (photoWork: PhotoWork) => void) => void
    toggleShowOnlyFlagged: () => void
}

interface Props extends OwnProps, StateProps, DispatchProps {
}

class Library extends React.Component<Props, undefined> {

    constructor(props) {
        super(props);

        bindMany(this, 'openExport', 'clearHighlight')
    }

    componentDidUpdate(prevProps, prevState) {
        const props = this.props

        const isExportEnabled = props.isActive && props.highlightedPhotoIds.length > 0
        const prevIsExportEnabled = prevProps.isActive && prevProps.highlightedPhotoIds.length > 0
        if (isExportEnabled !== prevIsExportEnabled) {
            ipcRenderer.send('toggleExportMenu', isExportEnabled)
            if (isExportEnabled) {
                ipcRenderer.on('exportClicked', this.openExport)
            } else {
                ipcRenderer.removeAllListeners('exportClicked')
            }
        }
    }

    componentDidMount() {
        this.props.fetchPhotos()
    }

    openExport() {
        this.props.openExport(this.props.highlightedPhotoIds)
    }

    clearHighlight() {
        this.props.setHighlightedPhotos([])
    }

    render() {
        const props = this.props

        let currentView;

        if (props.photosCount === 0) {
            currentView = <ReadyToScan />
        } else {
            currentView =
                <Grid
                    isActive={props.isActive}
                    photos={props.photos}
                    photoIds={props.photoIds}
                    highlightedPhotoIds={props.highlightedPhotoIds}
                    setHighlightedPhotos={props.setHighlightedPhotos}
                    setDetailPhotoById={props.setDetailPhotoById}
                    openExport={this.openExport}
                    setPhotosFlagged={props.setPhotosFlagged}
                />
        }

        return (
            <div ref="library" className={classNames(props.className, 'Library')}>
                <LibraryTopBar
                    className="Library-topBar"
                    photos={props.photos}
                    highlightedPhotoIds={props.highlightedPhotoIds}
                    showOnlyFlagged={props.showOnlyFlagged}
                    isShowingTrash={props.isShowingTrash}
                    openExport={this.openExport}
                    updatePhotoWork={props.updatePhotoWork}
                    setPhotosFlagged={props.setPhotosFlagged}
                    toggleShowOnlyFlagged={props.toggleShowOnlyFlagged}
                />
                <div className="Library-body">
                    {currentView}
                </div>
                <LibraryBottomBar
                    className="Library-bottomBar"
                    highlightedCount={props.highlightedPhotoIds.length}
                    photosCount={props.photosCount}
                    clearHighlight={this.clearHighlight}
                />
            </div>
        );
    }
}

const Connected = connect<StateProps, DispatchProps, OwnProps, AppState>(
    (state, props) => {
        return {
            ...props,
            photos: state.library.photos.data,
            photoIds: state.library.photos.ids,
            photosCount: state.library.photos.count,
            highlightedPhotoIds: state.library.photos.highlightedIds,
            showOnlyFlagged: state.library.filter.showOnlyFlagged,
            isShowingTrash: state.library.filter.mainFilter && state.library.filter.mainFilter.type === 'trash'
        }
    },
    dispatch => ({
        fetchPhotos,
        setHighlightedPhotos: highlightedIds => dispatch(setHighlightedPhotosAction(highlightedIds)),
        setDetailPhotoById,
        openExport: photoIds => dispatch(openExportAction(photoIds)),
        setPhotosFlagged,
        updatePhotoWork,
        toggleShowOnlyFlagged: () => {
            const oldFilter = store.getState().library.filter
            setPhotosFilter({ ...oldFilter, showOnlyFlagged: !oldFilter.showOnlyFlagged })
        }
    })
)(Library)

export default Connected
