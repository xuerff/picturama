import { ipcRenderer, remote, Menu as MenuType } from 'electron';
import * as classNames from 'classnames'
import * as React from 'react'
import * as Loader from 'react-loader'
import { findDOMNode } from 'react-dom'

import keymapManager from '../../keymap-manager'
import createVersionAndOpenWith from '../../create-version'
import AvailableEditors from '../../available-editors'

import AddTags from '../add-tags';
import Export from '../export';
import PhotoPane from './PhotoPane'
import PictureInfo from './PictureInfo'
import Button from '../widget/Button'
import ButtonGroup from '../widget/ButtonGroup'
import FaIcon from '../widget/icon/FaIcon'
import RotateLeftIcon from '../widget/icon/RotateLeftIcon'
import RotateRightIcon from '../widget/icon/RotateRightIcon'
import Toolbar from '../widget/Toolbar'
import { PhotoType, PhotoEffect } from '../../models/Photo'

const { Menu, MenuItem } = remote;

const availableEditors = new AvailableEditors();

let rotation = {};

rotation[1] = '';
rotation[0] = 'minus-ninety';

interface Props {
    style?: any
    className?: any
    actions: any
    toggleFlag: () => void
    photo: PhotoType
    effects?: PhotoEffect[]
    isFirst: boolean
    isLast: boolean
}

interface State {
    bound: boolean,
    modal: 'addTags' | 'none' | 'export',
    loaded: boolean,
    canvasWidth?: number
    canvasHeight?: number
}

export default class PictureDetail extends React.Component<Props, State> {

    menu: MenuType


    constructor(props) {
        super(props);

        this.state = { bound: false, modal: 'none', loaded: false };

        this.contextMenu = this.contextMenu.bind(this);
        this.bindEventListeners = this.bindEventListeners.bind(this);
        this.unbindEventListeners = this.unbindEventListeners.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.finishLoading = this.finishLoading.bind(this);
        this.cancelEvent = this.cancelEvent.bind(this);
        this.toggleDiff = this.toggleDiff.bind(this);
        this.moveToTrash = this.moveToTrash.bind(this);
        this.addEditorMenu = this.addEditorMenu.bind(this);
        this.updateCanvasSize = this.updateCanvasSize.bind(this)
        this.rotateLeft = this.rotateLeft.bind(this)
        this.rotateRight = this.rotateRight.bind(this)
    }

    contextMenu(e) {
        e.preventDefault();
        this.menu.popup(remote.getCurrentWindow());
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

    showTagDialog() {
        this.unbindEventListeners();
        this.setState({ modal: 'addTags' });
    }

    closeDialog() {
        this.bindEventListeners();
        this.setState({ modal: 'none' });
    }

    showExportDialog() {
        this.unbindEventListeners();
        this.setState({ modal: 'export' });
    }

    cancelEvent() {
        if (this.state.modal === 'none') // escape
            this.props.actions.setCurrent(-1);
        else
            this.closeDialog();
    }

    moveToTrash() {
        this.props.actions.moveToTrash(this.props.photo);
    }

    toggleDiff() {
        if (this.props.photo.versionNumber > 1)
            this.props.actions.toggleDiff();
    }

    rotateLeft() {
        this.props.actions.editRotate(-1)
    }

    rotateRight() {
        this.props.actions.editRotate(1)
    }

    componentDidMount() {
        this.menu = new remote.Menu();

        this.menu.append(new MenuItem({
            label: 'Add tag',
            click: this.showTagDialog.bind(this)
        }));

        this.menu.append(new MenuItem({
            label: 'Export',
            click: this.showExportDialog.bind(this)
        }));

        this.menu.append(new MenuItem({
            label: 'Move to trash',
            click: this.moveToTrash
        }));

        this.menu.append(new MenuItem({
            type: 'separator'
        }));

        availableEditors.editors.forEach(this.addEditorMenu);

        window.addEventListener('core:cancel', this.cancelEvent);
        window.addEventListener('detail:diff', this.toggleDiff);
        window.addEventListener('detail:flag', this.props.toggleFlag);
        window.addEventListener('detail:moveToTrash', this.moveToTrash);

        window.addEventListener(
            'detail:moveLeft',
            this.props.actions.setCurrentLeft
        );

        window.addEventListener(
            'detail:moveRight',
            this.props.actions.setCurrentRight
        );

        keymapManager.bind(this.refs.detail);
        this.bindEventListeners();
    }

    componentWillReceiveProps() {
        this.bindEventListeners();
    }

    componentDidUpdate(prevProps, prevState) {
        this.updateCanvasSize()
    }

    componentWillUnmount() {
        this.unbindEventListeners();

        window.removeEventListener('core:cancel', this.cancelEvent);
        window.removeEventListener('detail:diff', this.toggleDiff);
        window.removeEventListener('detail:flag', this.props.toggleFlag);
        window.removeEventListener('detail:moveToTrash', this.moveToTrash);

        window.removeEventListener(
            'detail:moveLeft',
            this.props.actions.setCurrentLeft
        );

        window.removeEventListener(
            'detail:moveRight',
            this.props.actions.setCurrentRight
        );

        keymapManager.unbind();
        delete this.menu;
    }

    bindEventListeners() {
        this.setState({ bound: true });

        window.addEventListener('resize', this.updateCanvasSize);
        document.addEventListener('contextmenu', this.contextMenu);

        ipcRenderer.send('toggleAddTagMenu', true);
        ipcRenderer.send('toggleExportMenu', true);

        ipcRenderer.on('addTagClicked', this.showTagDialog.bind(this));
    }

    unbindEventListeners() {
        this.setState({ bound: false });

        window.removeEventListener('resize', this.updateCanvasSize);
        document.removeEventListener('contextmenu', this.contextMenu);

        ipcRenderer.send('toggleAddTagMenu', false);
        ipcRenderer.send('toggleExportMenu', false);

        ipcRenderer.removeAllListeners('addTagClicked');
    }

    finishLoading() {
        this.setState({ loaded: true });
    }

    updateCanvasSize() {
        const state = this.state

        const bodyElem = findDOMNode(this.refs.body)
        const canvasWidth  = Math.round(bodyElem.clientWidth  * 0.9)
        const canvasHeight = Math.round(bodyElem.clientHeight * 0.9)

        if (state.canvasWidth !== canvasWidth || state.canvasHeight !== canvasHeight) {
            this.setState({ canvasWidth, canvasHeight })
        }
    }

    render() {
        const props = this.props
        const state = this.state

        let imgClass = classNames(
            'PictureDetail-image shadow--2dp',
            rotation[props.photo.orientation]
        );

        let showModal;

        if (this.state.modal === 'addTags') {
            showModal = <AddTags
                photo={props.photo}
                actions={props.actions}
                closeTagDialog={this.closeDialog} />;
        } else if (this.state.modal === 'export') {
            showModal = <Export
                actions={props.actions}
                photos={[ props.photo ]}
                closeExportDialog={this.closeDialog} />;
        }

        return (
            <div className={classNames(props.className, "PictureDetail")} style={props.style} ref="detail">
                <Toolbar className="PictureDetail-topBar">
                    <Button onClick={this.cancelEvent}>
                        <FaIcon name="chevron-left"/>
                        <span>Back to library</span>
                    </Button>
                    <ButtonGroup>
                        <Button enabled={!props.isFirst} onClick={props.actions.setCurrentLeft} tip="Previous image [left]">
                            <FaIcon name="arrow-left"/>
                        </Button>
                        <Button enabled={!props.isLast} onClick={props.actions.setCurrentRight} tip="Next image [right]">
                            <FaIcon name="arrow-right"/>
                        </Button>
                    </ButtonGroup>
                    <span className="PictureDetail-topBarRight">
                        <ButtonGroup>
                            <Button onClick={this.rotateLeft} tip="Rotate image left">
                                <RotateLeftIcon/>
                            </Button>
                            <Button onClick={this.rotateRight} tip="Rotate image right">
                                <RotateRightIcon/>
                            </Button>
                        </ButtonGroup>
                    </span>
                </Toolbar>

                <div className="PictureDetail-body" ref="body">
                    <PhotoPane
                        className="PictureDetail-image"
                        width={state.canvasWidth}
                        height={state.canvasHeight}
                        src={props.photo.thumb}
                        orientation={props.photo.orientation}
                        effects={props.effects}
                        onLoad={this.finishLoading}
                    />
                </div>

                <PictureInfo className="PictureDetail-infoBar" photo={props.photo} />
                <Loader loaded={this.state.loaded} />

                {showModal}
            </div>
        );
    }
}
