import { ipcRenderer } from 'electron'
import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { Button, ButtonGroup, Slider } from '@blueprintjs/core'

import { PhotoId, Photo as Photo, PhotoDetail, PhotoWork, PhotoSectionId } from 'common/CommonTypes'
import { msg } from 'common/i18n/i18n'
import { getNonRawUrl } from 'common/util/DataUtil'
import { bindMany } from 'common/util/LangUtil'

import PhotoInfo from 'app/ui/info/PhotoInfo'
import FaIcon from 'app/ui/widget/icon/FaIcon'
import PhotoActionButtons from 'app/ui/widget/PhotoActionButtons'
import Toolbar from 'app/ui/widget/Toolbar'
import { setDetailPhotoByIndex, setPreviousDetailPhoto, setNextDetailPhoto } from 'app/controller/DetailController'
import { Command, getCommandButtonProps, CommandGroupId, addCommandGroup, setCommandGroupEnabled, removeCommandGroup } from 'app/controller/HotkeyController'
import { updatePhotoWork, movePhotosToTrash, setPhotosFlagged, restorePhotosFromTrash } from 'app/controller/PhotoController'
import { setPhotoTags } from 'app/controller/PhotoTagController'
import { openExportAction, openDiffAction } from 'app/state/actions'
import { getPhotoById, getPhotoByIndex, getLoadedSectionById, getTagTitles } from 'app/state/selectors'
import { AppState } from 'app/state/StateTypes'
import BackgroundClient from 'app/BackgroundClient'

import CropModeToolbar from './CropModeToolbar'
import { DetailMode } from './DetailTypes'
import PhotoDetailBody from './PhotoDetailBody'

import './PhotoDetailPane.less'


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
    getFileSize(path: string): Promise<number>
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
    prevPhotoWork: PhotoWork | null,
    mode: DetailMode,
    bound: boolean,
    zoom: number
    minZoom: number
    maxZoom: number
    /** The PhotoWork which is changed in crop mode but not yet saved */
    editedPhotoWork: PhotoWork | null
    isShowingInfo: boolean
}

type CommandKeys = 'close' | 'toggleDiff' | 'prevPhoto' | 'nextPhoto' | 'edit'

export class PhotoDetailPane extends React.Component<Props, State> {

    private commands: { [K in CommandKeys]: Command }
    private commandGroupId: CommandGroupId

    constructor(props: Props) {
        super(props);
        bindMany(this, 'openExport', 'toggleDiff', 'toggleShowInfo', 'moveToTrash', 'onZoomSliderChange',
            'onZoomChange', 'onEdit', 'onEditDone', 'onPhotoWorkEdited')
        this.state = {
            prevPhotoWork: null,
            mode: 'view',
            zoom: 0,
            minZoom: 0,
            maxZoom: 2,
            bound: false,
            editedPhotoWork: null,
            isShowingInfo: false,
        }

        this.commands = {
            close: { combo: 'esc', label: msg('common_backToLibrary'), onAction: props.closeDetail },
            toggleDiff: { combo: 'd', label: 'Toggle diff' /* TODO: I18N */, onAction: this.toggleDiff },
            prevPhoto: { combo: 'left', enabled: () => !this.props.isFirst, label: msg('PhotoDetailPane_prevPhoto'), onAction: props.setPreviousDetailPhoto },
            nextPhoto: { combo: 'right', enabled: () => !this.props.isLast, label: msg('PhotoDetailPane_nextPhoto'), onAction: props.setNextDetailPhoto },
            edit: { combo: 'enter', label: msg('PhotoDetailPane_edit'), onAction: this.onEdit },
        }
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: State): Partial<State> | null {
        if (nextProps.photoWork !== prevState.prevPhotoWork) {
            return { prevPhotoWork: nextProps.photoWork, editedPhotoWork: null }
        }
        return null
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

    private onZoomSliderChange(sliderScale: number) {
        const { minZoom, maxZoom } = this.state
        const percentage = fromSliderScale(sliderScale)
        const zoom = minZoom + percentage * (maxZoom - minZoom)
        this.setState({ zoom })
    }

    private onZoomChange(zoom: number, minZoom: number, maxZoom: number) {
        this.setState({ zoom, minZoom, maxZoom })
    }

    private onEdit() {
        this.setState({ mode: 'crop' })
    }

    private onEditDone() {
        const editedPhotoWork = this.state.editedPhotoWork
        if (editedPhotoWork) {
            this.props.updatePhotoWork(this.props.photo, photoWork => {
                for (const key of Object.keys(photoWork)) {
                    delete photoWork[key]
                }
                for (const key of Object.keys(editedPhotoWork)) {
                    photoWork[key] = editedPhotoWork[key]
                }
            })
        }
        // NOTE: editedPhotoWork will be set to null when the new photoWork is set.
        //       This is important in order to avoid flickering (the old photoWork would be shown for a short time).
        this.setState({ mode: 'view' })
    }

    private onPhotoWorkEdited(photoWork: PhotoWork) {
        this.setState({ editedPhotoWork: photoWork })
    }

    render() {
        const { props, state, commands } = this

        return (
            <div
                className={classNames(props.className, 'PhotoDetailPane', { hasRightSidebar: state.isShowingInfo })}
                style={props.style}
            >
                {state.mode === 'view' &&
                    <Toolbar className="PhotoDetailPane-topBar" isLeft={true}>
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
                            <div className='PhotoDetailPane-zoomPane'>
                                <Slider className='PhotoDetailPane-zoomSlider'
                                    value={toSliderScale((state.zoom - state.minZoom) / (state.maxZoom - state.minZoom))}
                                    min={0}
                                    max={1}
                                    stepSize={0.000001}
                                    labelRenderer={false}
                                    showTrackFill={false}
                                    onChange={this.onZoomSliderChange}
                                />
                                <div className='PhotoDetailPane-zoomValue'>{state.zoom < state.minZoom + 0.00001 ? '' : `${Math.round(state.zoom * 100)}%`}</div>
                            </div>
                            <Button minimal={true} {...getCommandButtonProps(commands.edit)}>
                                <FaIcon name='crop'/>
                            </Button>
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
                }
                {state.mode === 'crop' &&
                    <CropModeToolbar
                        className='PhotoDetailPane-topBar'
                        photoWork={state.editedPhotoWork || props.photoWork}
                        onPhotoWorkChange={this.onPhotoWorkEdited}
                        onDone={this.onEditDone}
                    />
                }

                <PhotoDetailBody
                    className='PhotoDetailPane-body'
                    mode={state.mode}
                    src={getNonRawUrl(props.photo)}
                    srcPrev={props.photoPrev && getNonRawUrl(props.photoPrev)}
                    srcNext={props.photoNext && getNonRawUrl(props.photoNext)}
                    orientation={props.photo.orientation}
                    photoWork={state.editedPhotoWork || props.photoWork}
                    zoom={state.zoom}
                    onZoomChange={this.onZoomChange}
                    onPhotoWorkChange={this.onPhotoWorkEdited}
                />

                <PhotoInfo
                    className="PhotoDetailPane-rightSidebar"
                    isActive={state.isShowingInfo}
                    photo={(state.isShowingInfo && props.photo) || null}
                    photoDetail={state.isShowingInfo && props.photoDetail || null}
                    tags={props.tags}
                    closeInfo={this.toggleShowInfo}
                    getFileSize={props.getFileSize}
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
        const section = getLoadedSectionById(state, sectionId)
        return {
            ...props,
            sectionId: currentPhoto.sectionId,
            photo: getPhotoById(state, sectionId, currentPhoto.photoId)!,
            photoPrev: getPhotoByIndex(state, sectionId, currentPhoto.photoIndex - 1),
            photoNext: getPhotoByIndex(state, sectionId, currentPhoto.photoIndex + 1),
            photoDetail: currentPhoto.photoDetail,
            photoWork: currentPhoto.photoWork,
            tags: getTagTitles(state),
            isFirst: currentPhoto.photoIndex === 0,
            isLast: !section || currentPhoto.photoIndex === section.photoIds.length - 1
        }
    },
    dispatch => ({
        setPreviousDetailPhoto,
        setNextDetailPhoto,
        getFileSize: BackgroundClient.getFileSize,
        updatePhotoWork,
        setPhotosFlagged,
        setPhotoTags,
        movePhotosToTrash,
        restorePhotosFromTrash,
        openExport: (sectionId: PhotoSectionId, photoIds: PhotoId[]) => dispatch(openExportAction(sectionId, photoIds)),
        openDiff: () => dispatch(openDiffAction()),
        closeDetail: () => setDetailPhotoByIndex(null, null)
    })
)(PhotoDetailPane)

export default Connected
