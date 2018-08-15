import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'
import { Button, NonIdealState, Spinner } from '@blueprintjs/core'

import { PhotoId, PhotoType, PhotoWork } from '../../../common/models/Photo'
import CancelablePromise from '../../../common/util/CancelablePromise'
import { bindMany } from '../../../common/util/LangUtil'

import { setDetailPhotoById } from '../../controller/DetailController'
import { getThumbnailSrc, createThumbnail } from '../../controller/ImageProvider'
import { fetchTotalPhotoCount, fetchPhotos, setPhotosFilter, updatePhotoWork, setPhotosFlagged } from '../../controller/PhotoController'
import { setHighlightedPhotosAction, openExportAction } from '../../state/actions'
import { AppState } from '../../state/reducers'
import { PhotoData } from '../../state/reducers/library'
import store from '../../state/store'
import { keySymbols } from '../../UiConstants'
import LibraryTopBar from './LibraryTopBar'
import LibraryBottomBar from './LibraryBottomBar'
import Grid from './Grid'


interface OwnProps {
    style?: any
    className?: any
    isActive: boolean
}

interface StateProps {
    isFetching: boolean
    photos: PhotoData
    photoIds: PhotoId[]
    photosCount: number
    totalPhotosCount: number
    highlightedPhotoIds: PhotoId[]
    showOnlyFlagged: boolean
    isShowingTrash: boolean
}

interface DispatchProps {
    fetchTotalPhotoCount: () => void
    fetchPhotos: () => void
    getThumbnailSrc: (photo: PhotoType) => string
    createThumbnail: (photo: PhotoType) => CancelablePromise<string>
    setHighlightedPhotos: (highlightedIds: PhotoId[]) => void
    setDetailPhotoById: (photoId: PhotoId) => void
    openExport: (photoIds: PhotoId[]) => void
    setPhotosFlagged: (photos: PhotoType[], flag: boolean) => void
    updatePhotoWork: (photo: PhotoType, update: (photoWork: PhotoWork) => void) => void
    toggleShowOnlyFlagged: () => void
    startScanning: () => void
}

interface Props extends OwnProps, StateProps, DispatchProps {
}

export class Library extends React.Component<Props> {

    constructor(props: Props) {
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
        this.props.fetchTotalPhotoCount()
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

        if (props.isFetching) {
            currentView = <Spinner className="Library-spinner" size={Spinner.SIZE_LARGE} />
        } else if (props.totalPhotosCount === 0) {
            const description =
                <>
                    Press <code>{keySymbols.ctrlOrMacCommand}</code>+<code>R</code> or button below to start scanning.
                </>
            const action =
                <div className="bp3-dark">
                    <Button onClick={props.startScanning}>Start scanning</Button>
                </div>
            currentView =
                <NonIdealState
                    icon="zoom-out"
                    title="No photos imported"
                    description={description}
                    action={action}
                />
        } else if (props.photosCount === 0) {
            currentView =
                <NonIdealState
                    icon="zoom-out"
                    title="No photos found"
                    description="Your current selection doesn't match any photo. Please change your selection on the left."
                />
        } else {
            currentView =
                <Grid
                    isActive={props.isActive}
                    photos={props.photos}
                    photoIds={props.photoIds}
                    highlightedPhotoIds={props.highlightedPhotoIds}
                    getThumbnailSrc={props.getThumbnailSrc}
                    createThumbnail={props.createThumbnail}
                    setHighlightedPhotos={props.setHighlightedPhotos}
                    setDetailPhotoById={props.setDetailPhotoById}
                />
        }

        return (
            <div ref="library" className={classNames(props.className, 'Library')} style={props.style}>
                <LibraryTopBar
                    className="Library-topBar"
                    photosCount={props.photosCount}
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
            isFetching: state.library.photos.isFetching,
            photos: state.library.photos.data,
            photoIds: state.library.photos.ids,
            photosCount: state.library.photos.count,
            totalPhotosCount: state.library.photos.totalCount,
            highlightedPhotoIds: state.library.photos.highlightedIds,
            showOnlyFlagged: state.library.filter.showOnlyFlagged,
            isShowingTrash: state.library.filter.mainFilter && state.library.filter.mainFilter.type === 'trash'
        }
    },
    dispatch => ({
        fetchTotalPhotoCount,
        fetchPhotos,
        getThumbnailSrc,
        createThumbnail,
        setHighlightedPhotos: highlightedIds => dispatch(setHighlightedPhotosAction(highlightedIds)),
        setDetailPhotoById,
        openExport: photoIds => dispatch(openExportAction(photoIds)),
        setPhotosFlagged,
        updatePhotoWork,
        toggleShowOnlyFlagged: () => {
            const oldFilter = store.getState().library.filter
            setPhotosFilter({ ...oldFilter, showOnlyFlagged: !oldFilter.showOnlyFlagged })
        },
        startScanning: () => {
            ipcRenderer.send('start-scanning')
        }
    })
)(Library)

export default Connected
