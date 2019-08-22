import { ipcRenderer } from 'electron'
import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { Button, ButtonGroup, Spinner, ResizeSensor, IResizeEntry, Slider } from '@blueprintjs/core'

import { PhotoId, Photo as Photo, PhotoDetail, PhotoWork, PhotoSectionId } from 'common/CommonTypes'
import { msg } from 'common/i18n/i18n'
import { getNonRawUrl } from 'common/util/DataUtil'
import { bindMany } from 'common/util/LangUtil'

import PhotoInfo from 'ui/components/info/PhotoInfo'
import FaIcon from 'ui/components/widget/icon/FaIcon'
import PhotoActionButtons from 'ui/components/widget/PhotoActionButtons'
import Toolbar from 'ui/components/widget/Toolbar'
import { setDetailPhotoByIndex, setPreviousDetailPhoto, setNextDetailPhoto } from 'ui/controller/DetailController'
import { Command, getCommandButtonProps, CommandGroupId, addCommandGroup, setCommandGroupEnabled, removeCommandGroup } from 'ui/controller/HotkeyController'
import { updatePhotoWork, movePhotosToTrash, setPhotosFlagged, restorePhotosFromTrash } from 'ui/controller/PhotoController'
import { setPhotoTags } from 'ui/controller/PhotoTagController'
import { openExportAction, openDiffAction } from 'ui/state/actions'
import { AppState } from 'ui/state/reducers'
import { getPhotoById, getPhotoByIndex, getSectionById, getTagTitles } from 'ui/state/selectors'

import PhotoPane from './PhotoPane'

import './PictureDetail.less'


interface OwnProps {
    style?: any
    className?: any
    isActive: boolean
}

interface StateProps {
    sectionId: PhotoSectionId
    photo: Photo
    photoPrev: Photo | null
    photoNext: Photo | null
    photoDetail: PhotoDetail | null
    photoWork: PhotoWork | null
    tags: string[]
    isFirst: boolean
    isLast: boolean
}

interface DispatchProps {
    setPreviousDetailPhoto: () => void
    setNextDetailPhoto: () => void
    updatePhotoWork: (photo: Photo, update: (photoWork: PhotoWork) => void) => void
    setPhotosFlagged: (photos: Photo[], flag: boolean) => void
    setPhotoTags: (photo: Photo, tags: string[]) => void
    movePhotosToTrash: (photos: Photo[]) => void
    restorePhotosFromTrash: (photos: Photo[]) => void
    openExport: (sectionId: PhotoSectionId, photoIds: PhotoId[]) => void
    openDiff: () => void
    closeDetail: () => void
}

export interface Props extends OwnProps, StateProps, DispatchProps {
}

interface State {
    bound: boolean,
    loading: boolean,
    bodyWidth: number
    bodyHeight: number
    zoom: number
    minZoom: number
    maxZoom: number
    isShowingInfo: boolean
}

type CommandKeys = 'close' | 'toggleDiff' | 'prevPhoto' | 'nextPhoto'

export class PictureDetail extends React.Component<Props, State> {

    private commands: { [K in CommandKeys]: Command }
    private commandGroupId: CommandGroupId

    constructor(props: Props) {
        super(props);

        this.state = { zoom: 0, minZoom: 0, maxZoom: 2, bound: false, loading: true, bodyWidth: 0, bodyHeight: 0, isShowingInfo: false }

        bindMany(this, 'setLoading', 'openExport', 'toggleDiff', 'toggleShowInfo', 'moveToTrash', 'onZoomSliderChange',
            'onZoomChange', 'onBodyResize')

        this.commands = {
            close: { combo: 'esc', label: msg('common_backToLibrary'), onAction: props.closeDetail },
            toggleDiff: { combo: 'd', label: 'Toggle diff' /* TODO: I18N */, onAction: this.toggleDiff },
            prevPhoto: { combo: 'left', enabled: () => !this.props.isFirst, label: msg('PictureDetail_prevPhoto'), onAction: props.setPreviousDetailPhoto },
            nextPhoto: { combo: 'right', enabled: () => !this.props.isLast, label: msg('PictureDetail_nextPhoto'), onAction: props.setNextDetailPhoto },
        }
    }

    componentDidMount() {
        this.commandGroupId = addCommandGroup(this.commands)
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const { props } = this
        if (props.isActive !== prevProps.isActive) {
            ipcRenderer.send('toggleExportMenu', props.isActive)
            setCommandGroupEnabled(this.commandGroupId, props.isActive)
        }
    }

    componentWillUnmount() {
        removeCommandGroup(this.commandGroupId)
    }

    openExport() {
        const props = this.props
        props.openExport(props.sectionId, [ props.photo.id ])
    }

    moveToTrash() {
        this.props.movePhotosToTrash([ this.props.photo ])
    }

    toggleDiff() {
        const photoDetail = this.props.photoDetail
        if (photoDetail && photoDetail.versions.length > 0) {
            this.props.openDiff()
        }
    }

    toggleShowInfo() {
        this.setState({ isShowingInfo: !this.state.isShowingInfo })
    }

    setLoading(loading: boolean) {
        if (loading !== this.state.loading) {
            this.setState({ loading })
        }
    }

    private onZoomSliderChange(sliderScale: number) {
        const { minZoom, maxZoom } = this.state
        const percentage = fromSliderScale(sliderScale)
        const zoom = minZoom + percentage * (maxZoom - minZoom)
        this.setState({ zoom })
    }

    private onZoomChange(zoom: number, minZoom: number, maxZoom: number) {
        this.setState({ zoom, minZoom, maxZoom })
    }

    onBodyResize(entries: IResizeEntry[]) {
        const state = this.state

        const contentRect = entries[0].contentRect
        const bodyWidth  = contentRect.width
        const bodyHeight = contentRect.height

        if (state.bodyWidth !== bodyWidth || state.bodyHeight !== bodyHeight) {
            this.setState({ bodyWidth, bodyHeight })
        }
    }

    render() {
        const { props, state, commands } = this

        return (
            <div
                className={classNames(props.className, 'PictureDetail', { hasRightSidebar: state.isShowingInfo })}
                style={props.style}
            >
                <Toolbar className="PictureDetail-topBar" isLeft={true}>
                    <Button onClick={commands.close.onAction}>
                        <FaIcon name="chevron-left"/>
                        <span>{commands.close.label}</span>
                    </Button>
                    <ButtonGroup>
                        <Button minimal={true} {...getCommandButtonProps(commands.prevPhoto)}>
                            <FaIcon name="arrow-left"/>
                        </Button>
                        <Button minimal={true} {...getCommandButtonProps(commands.nextPhoto)}>
                            <FaIcon name="arrow-right"/>
                        </Button>
                    </ButtonGroup>
                    <span className="pull-right">
                        <div className='PictureDetail-zoomPane'>
                            <Slider className='PictureDetail-zoomSlider'
                                value={toSliderScale((state.zoom - state.minZoom) / (state.maxZoom - state.minZoom))}
                                min={0}
                                max={1}
                                stepSize={0.000001}
                                labelRenderer={false}
                                showTrackFill={false}
                                onChange={this.onZoomSliderChange}
                            />
                            <div className='PictureDetail-zoomValue'>{state.zoom < state.minZoom + 0.00001 ? '' : `${Math.round(state.zoom * 100)}%`}</div>
                        </div>
                        <PhotoActionButtons
                            selectedSectionId={props.sectionId}
                            selectedPhotos={[ props.photo ]}
                            isShowingTrash={!!props.photo.trashed}
                            isShowingInfo={state.isShowingInfo}
                            openExport={props.openExport}
                            updatePhotoWork={props.updatePhotoWork}
                            setPhotosFlagged={props.setPhotosFlagged}
                            movePhotosToTrash={props.movePhotosToTrash}
                            restorePhotosFromTrash={props.restorePhotosFromTrash}
                            toggleShowInfo={this.toggleShowInfo}
                        />
                    </span>
                </Toolbar>

                <ResizeSensor onResize={this.onBodyResize}>
                    <div className="PictureDetail-body bp3-dark">
                        <PhotoPane
                            className="PictureDetail-image"
                            width={state.bodyWidth}
                            height={state.bodyHeight}
                            src={getNonRawUrl(props.photo)}
                            srcPrev={props.photoPrev && getNonRawUrl(props.photoPrev)}
                            srcNext={props.photoNext && getNonRawUrl(props.photoNext)}
                            orientation={props.photo.orientation}
                            photoWork={props.photoWork}
                            zoom={state.zoom}
                            setLoading={this.setLoading}
                            onZoomChange={this.onZoomChange}
                        />
                        {state.loading &&
                            <Spinner className="PictureDetail-spinner" size={Spinner.SIZE_LARGE} />
                        }
                    </div>
                </ResizeSensor>

                <PhotoInfo
                    className="PictureDetail-rightSidebar"
                    isActive={state.isShowingInfo}
                    photo={(state.isShowingInfo && props.photo) || null}
                    photoDetail={state.isShowingInfo && props.photoDetail || null}
                    tags={props.tags}
                    closeInfo={this.toggleShowInfo}
                    setPhotoTags={props.setPhotoTags}
                />
            </div>
        );
    }

}


function toSliderScale(percentage: number): number {
    const sliderScale = Math.max(0, Math.min(1, Math.sqrt(percentage)))

    // Workaround: For very small values (e.g. `6e-16`) the Slider widget shows no track bar
    // -> Pull small values to 0
    return sliderScale < 0.000001 ? 0 : sliderScale
}

function fromSliderScale(sliderScale: number): number {
    return sliderScale * sliderScale
}


const Connected = connect<StateProps, DispatchProps, OwnProps, AppState>(
    (state: AppState, props) => {
        const currentPhoto = state.detail!.currentPhoto
        const sectionId = currentPhoto.sectionId
        const section = getSectionById(sectionId)
        return {
            ...props,
            sectionId: currentPhoto.sectionId,
            photo: getPhotoById(sectionId, currentPhoto.photoId)!,
            photoPrev: getPhotoByIndex(sectionId, currentPhoto.photoIndex - 1),
            photoNext: getPhotoByIndex(sectionId, currentPhoto.photoIndex + 1),
            photoDetail: currentPhoto.photoDetail,
            photoWork: currentPhoto.photoWork,
            tags: getTagTitles(),
            isFirst: currentPhoto.photoIndex === 0,
            isLast: !section || !section.photoIds || currentPhoto.photoIndex === section.photoIds.length - 1
        }
    },
    dispatch => ({
        setPreviousDetailPhoto,
        setNextDetailPhoto,
        updatePhotoWork,
        setPhotosFlagged,
        setPhotoTags,
        movePhotosToTrash,
        restorePhotosFromTrash,
        openExport: (sectionId: PhotoSectionId, photoIds: PhotoId[]) => dispatch(openExportAction(sectionId, photoIds)),
        openDiff: () => dispatch(openDiffAction()),
        closeDetail: () => setDetailPhotoByIndex(null, null)
    })
)(PictureDetail)

export default Connected
