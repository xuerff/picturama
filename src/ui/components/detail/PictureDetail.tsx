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
import MdRotateLeftIcon from '../widget/icon/MdRotateLeftIcon'
import MdRotateRightIcon from '../widget/icon/MdRotateRightIcon'
import Toolbar from '../widget/Toolbar'
import { setDetailPhotoByIndex, setPreviousDetailPhoto, setNextDetailPhoto, toggleDetailPhotoFlag } from '../../controller/DetailController'
import { getNonRawImgPath } from '../../controller/ImageProvider'
import { updatePhotoWork, movePhotosToTrash } from '../../controller/PhotoController'
import { PhotoId, PhotoType, PhotoDetail, PhotoWork, PhotoSectionId } from '../../../common/models/Photo'
import { openExportAction, openTagsEditorAction, openDiffAction } from '../../state/actions'
import { AppState } from '../../state/reducers'
import { getPhotoById, getPhotoByIndex, getSectionById } from '../../state/selectors'
import { rotate } from '../../../common/util/EffectsUtil'
import { bindMany } from '../../../common/util/LangUtil'

import './PictureDetail.less'

const { MenuItem } = remote;


const availableEditors = new AvailableEditors();

let rotation = {};

rotation[1] = '';
rotation[0] = 'minus-ninety';


interface OwnProps {
    style?: any
    className?: any
    isActive: boolean
}

interface StateProps {
    sectionId: PhotoSectionId
    photo: PhotoType
    photoPrev?: PhotoType
    photoNext?: PhotoType
    photoDetail?: PhotoDetail
    photoWork?: PhotoWork
    isFirst: boolean
    isLast: boolean
}

interface DispatchProps {
    setPreviousDetailPhoto: () => void
    setNextDetailPhoto: () => void
    updatePhotoWork: (photo: PhotoType, update: (photoWork: PhotoWork) => void) => void
    toggleFlag: () => void
    movePhotosToTrash: (photos: PhotoType[]) => void
    openExport: (sectionId: PhotoSectionId, photoIds: PhotoId[]) => void
    openTagsEditor: () => void
    openDiff: () => void
    closeDetail: () => void
}

interface Props extends OwnProps, StateProps, DispatchProps {
}

interface State {
    bound: boolean,
    loading: boolean,
    canvasWidth?: number
    canvasHeight?: number
    isShowingInfo: boolean
}

export class PictureDetail extends React.Component<Props, State> {

    menu: MenuType


    constructor(props: Props) {
        super(props);

        this.state = { bound: false, loading: true, isShowingInfo: false }

        bindMany(this, 'contextMenu', 'bindEventListeners', 'unbindEventListeners', 'setLoading', 'openExport',
            'toggleDiff', 'toggleShowInfo', 'moveToTrash', 'addEditorMenu', 'onBodyResize', 'rotateLeft', 'rotateRight')
    }

    componentDidMount() {
        this.menu = new remote.Menu();

        this.menu.append(new MenuItem({
            label: 'Add tag',
            click: this.props.openTagsEditor
        }));

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

        ipcRenderer.send('toggleAddTagMenu', true)
        ipcRenderer.send('toggleExportMenu', true)

        ipcRenderer.on('addTagClicked', this.props.openTagsEditor)

        window.addEventListener('core:cancel', this.props.closeDetail)
        window.addEventListener('detail:diff', this.toggleDiff);
        window.addEventListener('detail:flag', this.props.toggleFlag);
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

        ipcRenderer.send('toggleAddTagMenu', false)
        ipcRenderer.send('toggleExportMenu', false)

        ipcRenderer.removeListener('addTagClicked', this.props.openTagsEditor)

        window.removeEventListener('core:cancel', this.props.closeDetail)
        window.removeEventListener('detail:diff', this.toggleDiff);
        window.removeEventListener('detail:flag', this.props.toggleFlag);
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

    rotateLeft() {
        this.rotate(-1)
    }

    rotateRight() {
        this.rotate(1)
    }

    rotate(turns: number) {
        this.props.updatePhotoWork(this.props.photo, photoWorks => rotate(photoWorks, turns))
    }

    setLoading(loading: boolean) {
        if (loading !== this.state.loading) {
            this.setState({ loading })
        }
    }

    onBodyResize(entries: IResizeEntry[]) {
        const state = this.state

        const contentRect = entries[0].contentRect
        const canvasWidth  = Math.round(contentRect.width  * 0.9)
        const canvasHeight = Math.round(contentRect.height * 0.9)

        if (state.canvasWidth !== canvasWidth || state.canvasHeight !== canvasHeight) {
            this.setState({ canvasWidth, canvasHeight })
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
                        <ButtonGroup>
                            <Button minimal={true} onClick={this.rotateLeft} title="Rotate left">
                                <MdRotateLeftIcon/>
                            </Button>
                            <Button minimal={true} onClick={this.rotateRight} title="Rotate right">
                                <MdRotateRightIcon/>
                            </Button>
                        </ButtonGroup>
                        <Button
                            className={classNames('PictureDetail-toggleButton', { isActive: !!props.photo.flag })}
                            minimal={true}
                            onClick={props.toggleFlag}
                            title={props.photo.flag ? 'Remove flag' : 'Flag'}
                        >
                            <FaIcon name="flag" />
                        </Button>
                        <Button
                            minimal={true}
                            icon="info-sign"
                            title={state.isShowingInfo ? "Hide photo info" : "Show photo info"}
                            active={state.isShowingInfo}
                            onClick={this.toggleShowInfo}
                        />
                    </span>
                </Toolbar>

                <ResizeSensor onResize={this.onBodyResize}>
                    <div className="PictureDetail-body">
                        <PhotoPane
                            className="PictureDetail-image"
                            width={state.canvasWidth}
                            height={state.canvasHeight}
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
                    photo={state.isShowingInfo && props.photo}
                    closeInfo={this.toggleShowInfo}                
                />
            </div>
        );
    }
}

const Connected = connect<StateProps, DispatchProps, OwnProps, AppState>(
    (state: AppState, props) => {
        const currentPhoto = state.detail && state.detail.currentPhoto
        const sectionId = currentPhoto.sectionId
        return {
            ...props,
            sectionId: currentPhoto.sectionId,
            photo: getPhotoById(sectionId, currentPhoto.photoId),
            photoPrev: getPhotoByIndex(sectionId, currentPhoto.photoIndex - 1),
            photoNext: getPhotoByIndex(sectionId, currentPhoto.photoIndex + 1),
            photoDetail: currentPhoto.photoDetail,
            photoWork: currentPhoto.photoWork,
            isFirst: currentPhoto.photoIndex === 0,
            isLast: currentPhoto.photoIndex === getSectionById(sectionId).photoIds.length - 1
        }
    },
    dispatch => ({
        setPreviousDetailPhoto,
        setNextDetailPhoto,
        updatePhotoWork,
        toggleFlag: toggleDetailPhotoFlag,
        movePhotosToTrash,
        openExport: (sectionId: PhotoSectionId, photoIds: PhotoId[]) => dispatch(openExportAction(sectionId, photoIds)),
        openTagsEditor: () => dispatch(openTagsEditorAction()),
        openDiff: () => dispatch(openDiffAction()),
        closeDetail: () => setDetailPhotoByIndex(null, null)
    })
)(PictureDetail)

export default Connected
