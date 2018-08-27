import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ipcRenderer } from 'electron'
import { Button, NonIdealState, Spinner } from '@blueprintjs/core'

import { PhotoId, PhotoType, PhotoWork, PhotoSectionId, PhotoSectionById, PhotoDetail } from '../../../common/models/Photo'
import CancelablePromise from '../../../common/util/CancelablePromise'
import { bindMany } from '../../../common/util/LangUtil'

import { setDetailPhotoById } from '../../controller/DetailController'
import { getThumbnailSrc } from '../../controller/ImageProvider'
import { getGridLayout, setInfoPhoto, createThumbnail } from '../../controller/LibraryController'
import { fetchTotalPhotoCount, fetchSections, setLibraryFilter, updatePhotoWork, setPhotosFlagged } from '../../controller/PhotoController'
import { setPhotoTags } from '../../controller/PhotoTagController'
import { setSelectedPhotosAction, openExportAction, setGridRowHeightAction } from '../../state/actions'
import { AppState } from '../../state/reducers'
import { getTagTitles } from '../../state/selectors'
import { keySymbols } from '../../UiConstants'
import { FetchState } from '../../UITypes'
import store from '../../state/store'
import PhotoInfo from '../info/PhotoInfo'
import LibraryTopBar from './LibraryTopBar'
import LibraryBottomBar from './LibraryBottomBar'
import Grid, { GetGridLayoutFunction } from './Grid'

import './Library.less'


interface OwnProps {
    style?: any
    className?: any
    isActive: boolean
}

interface StateProps {
    isFetching: boolean
    photoCount: number
    totalPhotoCount: number | null
    sectionIds: PhotoSectionId[]
    sectionById: PhotoSectionById
    selectedSectionId: PhotoSectionId
    selectedPhotoIds: PhotoId[]
    infoPhoto: PhotoType | null
    infoPhotoDetail: PhotoDetail | null
    tags: string[]
    gridRowHeight: number
    showOnlyFlagged: boolean
    isShowingTrash: boolean
}

interface DispatchProps {
    fetchTotalPhotoCount: () => void
    fetchSections: () => void
    getGridLayout: GetGridLayoutFunction
    getThumbnailSrc: (photo: PhotoType) => string
    createThumbnail: (sectionId: PhotoSectionId, photo: PhotoType) => CancelablePromise<string>
    setGridRowHeight: (gridRowHeight: number) => void
    setSelectedPhotos: (sectionId: PhotoSectionId, photoIds: PhotoId[]) => void
    setDetailPhotoById: (sectionId: PhotoSectionId, photoId: PhotoId) => void
    setInfoPhoto: (sectionId: PhotoSectionId | null, photoId: PhotoId | null) => void
    openExport: (sectionId: PhotoSectionId, photoIds: PhotoId[]) => void
    setPhotosFlagged: (photos: PhotoType[], flag: boolean) => void
    setPhotoTags: (photo: PhotoType, tags: string[]) => void
    updatePhotoWork: (photo: PhotoType, update: (photoWork: PhotoWork) => void) => void
    toggleShowOnlyFlagged: () => void
    startScanning: () => void
}

interface Props extends OwnProps, StateProps, DispatchProps {
}

interface State {
    isShowingInfo: boolean
}

export class Library extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = { isShowingInfo: false }

        bindMany(this, 'openExport', 'clearHighlight', 'toggleShowInfo')
    }

    componentDidUpdate(prevProps: Props, prevState) {
        const props = this.props

        const isExportEnabled = props.isActive && props.selectedPhotoIds.length > 0
        const prevIsExportEnabled = prevProps.isActive && prevProps.selectedPhotoIds.length > 0
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
        this.props.fetchSections()
    }

    openExport() {
        const props = this.props
        props.openExport(props.selectedSectionId, props.selectedPhotoIds)
    }

    clearHighlight() {
        const props = this.props
        props.setSelectedPhotos(props.selectedSectionId, [])
    }

    toggleShowInfo() {
        this.setState({ isShowingInfo: !this.state.isShowingInfo })
    }

    updateInfoPhoto() {
        const props = this.props
        const state = this.state

        const infoPhotoId = (state.isShowingInfo && props.selectedPhotoIds.length !== 0)
            ? props.selectedPhotoIds[0]
            : null
        const propsInfoPhotoId = props.infoPhoto ? props.infoPhoto.id : null
        if (propsInfoPhotoId !== infoPhotoId) {
            props.setInfoPhoto(props.selectedSectionId, infoPhotoId)
        }
    }

    render() {
        const props = this.props
        const state = this.state

        this.updateInfoPhoto()

        let currentView
        if (props.isFetching) {
            currentView = <Spinner className="Library-spinner" size={Spinner.SIZE_LARGE} />
        } else if (props.totalPhotoCount === 0) {
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
        } else if (props.photoCount === 0) {
            currentView =
                <NonIdealState
                    icon="zoom-out"
                    title="No photos found"
                    description="Your current selection doesn't match any photo. Please change your selection on the left."
                />
        } else {
            currentView =
                <Grid
                    className="Library-grid"
                    isActive={props.isActive}
                    sectionIds={props.sectionIds}
                    sectionById={props.sectionById}
                    selectedSectionId={props.selectedSectionId}
                    selectedPhotoIds={props.selectedPhotoIds}
                    gridRowHeight={props.gridRowHeight}
                    getGridLayout={props.getGridLayout}
                    getThumbnailSrc={props.getThumbnailSrc}
                    createThumbnail={props.createThumbnail}
                    setSelectedPhotos={props.setSelectedPhotos}
                    setDetailPhotoById={props.setDetailPhotoById}
                />
        }

        return (
            <div
                ref="library"
                className={classNames(props.className, 'Library', { hasRightSidebar: state.isShowingInfo })}
                style={props.style}
            >
                <LibraryTopBar
                    className="Library-topBar"
                    selectedSectionId={props.selectedSectionId}
                    selectedPhotos={props.selectedPhotoIds.map(photoId => props.sectionById[props.selectedSectionId].photoData[photoId])}
                    isShowingTrash={props.isShowingTrash}
                    isShowingInfo={state.isShowingInfo}
                    photosCount={props.photoCount}
                    showOnlyFlagged={props.showOnlyFlagged}
                    openExport={props.openExport}
                    updatePhotoWork={props.updatePhotoWork}
                    setPhotosFlagged={props.setPhotosFlagged}
                    toggleShowOnlyFlagged={props.toggleShowOnlyFlagged}
                    toggleShowInfo={this.toggleShowInfo}
                />
                <div className="Library-body">
                    {currentView}
                </div>
                <LibraryBottomBar
                    className="Library-bottomBar"
                    highlightedCount={props.selectedPhotoIds.length}
                    photosCount={props.photoCount}
                    gridRowHeight={props.gridRowHeight}
                    clearHighlight={this.clearHighlight}
                    setGridRowHeight={props.setGridRowHeight}
                />
                <PhotoInfo
                    className="Library-rightSidebar"
                    isActive={state.isShowingInfo}
                    photo={props.infoPhoto}
                    photoDetail={props.infoPhotoDetail}
                    tags={props.tags}
                    closeInfo={this.toggleShowInfo}
                    setPhotoTags={props.setPhotoTags}
                />
            </div>
        );
    }
}


const Connected = connect<StateProps, DispatchProps, OwnProps, AppState>(
    (state: AppState, props) => {
        const sections = state.data.sections
        const libraryInfo = state.library.info
        return {
            ...props,
            isFetching: sections.totalPhotoCount === null || sections.fetchState === FetchState.FETCHING,
            photoCount: sections.photoCount,
            totalPhotoCount: sections.totalPhotoCount,
            sectionIds: sections.ids,
            sectionById: sections.byId,
            selectedSectionId: state.library.selection.sectionId,
            selectedPhotoIds: state.library.selection.photoIds,
            infoPhoto: libraryInfo ? sections.byId[libraryInfo.sectionId].photoData[libraryInfo.photoId] : null,
            infoPhotoDetail: libraryInfo && libraryInfo.photoDetail,
            tags: getTagTitles(),
            gridRowHeight: state.library.display.gridRowHeight,
            showOnlyFlagged: state.library.filter.showOnlyFlagged,
            isShowingTrash: state.library.filter.mainFilter && state.library.filter.mainFilter.type === 'trash'
        }
    },
    dispatch => ({
        fetchTotalPhotoCount,
        fetchSections,
        getGridLayout,
        getThumbnailSrc,
        createThumbnail,
        setDetailPhotoById,
        setInfoPhoto,
        setPhotosFlagged,
        setPhotoTags,
        updatePhotoWork,
        toggleShowOnlyFlagged: () => {
            const oldFilter = store.getState().library.filter
            setLibraryFilter({ ...oldFilter, showOnlyFlagged: !oldFilter.showOnlyFlagged })
        },
        startScanning: () => {
            ipcRenderer.send('start-scanning')
        },
        ...bindActionCreators({
            setGridRowHeight: setGridRowHeightAction,
            setSelectedPhotos: setSelectedPhotosAction,
            openExport: openExportAction
        }, dispatch)
    })
)(Library)

export default Connected
