import { ipcRenderer, remote, Menu as MenuType } from 'electron'
import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { Button, ButtonGroup, Spinner, ResizeSensor, IResizeEntry } from '@blueprintjs/core'

import keymapManager from '../../keymap-manager'
import createVersionAndOpenWith from '../../create-version'
import AvailableEditors from '../../available-editors'

import PhotoPane from './PhotoPane'
import PhotoInfo from '../info/PhotoInfo'
import FaIcon from '../widget/icon/FaIcon'
import PhotoActionButtons from '../widget/PhotoActionButtons'
import Toolbar from '../widget/Toolbar'
import { setDetailPhotoByIndex, setPreviousDetailPhoto, setNextDetailPhoto } from '../../controller/DetailController'
import { getNonRawImgPath } from '../../controller/ImageProvider'
import { updatePhotoWork, movePhotosToTrash, setPhotosFlagged, restorePhotosFromTrash } from '../../controller/PhotoController'
import { setPhotoTags } from '../../controller/PhotoTagController'
import { PhotoId, PhotoType, PhotoDetail, PhotoWork, PhotoSectionId } from '../../../common/models/Photo'
import { openExportAction, openDiffAction } from '../../state/actions'
import { AppState } from '../../state/reducers'
import { getPhotoById, getPhotoByIndex, getSectionById, getTagTitles } from '../../state/selectors'
import { bindMany } from '../../../common/util/LangUtil'

import './PictureDetail.less'

const { MenuItem } = remote;


const availableEditors = new AvailableEditors();

interface OwnProps {
    style?: any
    className?: any
    isActive: boolean
}

interface StateProps {
    sectionId: PhotoSectionId
    photo: PhotoType
    photoPrev: PhotoType | null
    photoNext: PhotoType | null
    photoDetail: PhotoDetail | null
    photoWork: PhotoWork | null
    tags: string[]
    isFirst: boolean
    isLast: boolean
}

interface DispatchProps {
    setPreviousDetailPhoto: () => void
    setNextDetailPhoto: () => void
    updatePhotoWork: (photo: PhotoType, update: (photoWork: PhotoWork) => void) => void
    setPhotosFlagged: (photos: PhotoType[], flag: boolean) => void
    setPhotoTags: (photo: PhotoType, tags: string[]) => void
    movePhotosToTrash: (photos: PhotoType[]) => void
    restorePhotosFromTrash: (photos: PhotoType[]) => void
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
    isShowingInfo: boolean
}

export class PictureDetail extends React.Component<Props, State> {

    menu: MenuType


    constructor(props: Props) {
        super(props);

        this.state = { bound: false, loading: true, bodyWidth: 0, bodyHeight: 0, isShowingInfo: false }

        bindMany(this, 'contextMenu', 'bindEventListeners', 'unbindEventListeners', 'setLoading', 'openExport',
            'toggleDiff', 'toggleShowInfo', 'moveToTrash', 'addEditorMenu', 'onBodyResize')
    }

    componentDidMount() {
        this.menu = new remote.Menu();

        this.menu.append(new MenuItem({
            label: 'Export',
            click: this.openExport
        }));

        this.menu.append(new MenuItem({
            label: 'Move to trash',
            click: this.moveToTrash
        }));

        this.menu.append(new MenuItem({
            type: 'separator'
        }));

        availableEditors.editors.forEach(this.addEditorMenu);

        this.bindEventListeners()
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.isActive !== prevProps.isActive) {
            if (this.props.isActive) {
                this.bindEventListeners()
            } else {
                this.unbindEventListeners()
            }
        }
    }

    componentWillUnmount() {
        this.unbindEventListeners();

        delete this.menu;
    }

    bindEventListeners() {
        this.setState({ bound: true })

        document.addEventListener('contextmenu', this.contextMenu)

        ipcRenderer.send('toggleExportMenu', true)

        window.addEventListener('core:cancel', this.props.closeDetail)
        window.addEventListener('detail:diff', this.toggleDiff);
        window.addEventListener('detail:moveToTrash', this.moveToTrash);

        window.addEventListener(
            'detail:moveLeft',
            this.props.setPreviousDetailPhoto
        );

        window.addEventListener(
            'detail:moveRight',
            this.props.setNextDetailPhoto
        );

        keymapManager.bind(this.refs.detail);
    }

    unbindEventListeners() {
        this.setState({ bound: false })

        document.removeEventListener('contextmenu', this.contextMenu)

        ipcRenderer.send('toggleExportMenu', false)

        window.removeEventListener('core:cancel', this.props.closeDetail)
        window.removeEventListener('detail:diff', this.toggleDiff);
        window.removeEventListener('detail:moveToTrash', this.moveToTrash);

        window.removeEventListener(
            'detail:moveLeft',
            this.props.setPreviousDetailPhoto
        );

        window.removeEventListener(
            'detail:moveRight',
            this.props.setNextDetailPhoto
        );

        keymapManager.unbind();
    }

    contextMenu(e) {
        e.preventDefault();
        this.menu.popup({})
    }

    addEditorMenu(editor) {
        this.menu.append(new MenuItem({
            label: `Open with ${editor.name}`,
            click: () => {
                createVersionAndOpenWith(
                    this.props.photo,
                    editor.format,
                    editor.cmd
                );
            }
        }));
    }

    openExport() {
        const props = this.props
        this.unbindEventListeners();
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
        const props = this.props
        const state = this.state

        return (
            <div
                ref="detail"
                className={classNames(props.className, 'PictureDetail', { hasRightSidebar: state.isShowingInfo })}
                style={props.style}
            >
                <Toolbar className="PictureDetail-topBar" isLeft={true}>
                    <Button onClick={props.closeDetail}>
                        <FaIcon name="chevron-left"/>
                        <span>Back to library</span>
                    </Button>
                    <ButtonGroup>
                        <Button minimal={true} disabled={props.isFirst} onClick={props.setPreviousDetailPhoto} title="Previous image [left]">
                            <FaIcon name="arrow-left"/>
                        </Button>
                        <Button minimal={true} disabled={props.isLast} onClick={props.setNextDetailPhoto} title="Next image [right]">
                            <FaIcon name="arrow-right"/>
                        </Button>
                    </ButtonGroup>
                    <span className="pull-right">
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
                            src={getNonRawImgPath(props.photo)}
                            srcPrev={props.photoPrev && getNonRawImgPath(props.photoPrev)}
                            srcNext={props.photoNext && getNonRawImgPath(props.photoNext)}
                            orientation={props.photo.orientation}
                            photoWork={props.photoWork}
                            setLoading={this.setLoading}
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
