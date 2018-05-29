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
import { rotate } from '../../util/EffectsUtil'
import { bindMany } from '../../util/LangUtil'

const { Menu, MenuItem } = remote;

const availableEditors = new AvailableEditors();

let rotation = {};

rotation[1] = '';
rotation[0] = 'minus-ninety';

interface Props {
    style?: any
    className?: any
    photo: PhotoType
    effects?: PhotoEffect[]
    isFirst: boolean
    isLast: boolean
    actions: any
    setCurrentLeft: () => void 
    setCurrentRight: () => void 
    toggleFlag: () => void
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

        bindMany(this, 'contextMenu', 'bindEventListeners', 'unbindEventListeners', 'closeDialog', 'finishLoading',
            'cancelEvent', 'toggleDiff', 'moveToTrash', 'addEditorMenu', 'updateCanvasSize', 'rotateLeft', 'rotateRight',
            'toggleFlagged')
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
        this.rotate(-1)
    }

    rotateRight() {
        this.rotate(1)
    }

    rotate(turns: number) {
        const props = this.props

        const prevEffects = props.effects
        if (!prevEffects) {
            return
        }

        const nextEffects = rotate(prevEffects, turns)
        props.actions.storeEffects(props.photo, nextEffects)
    }

    toggleFlagged() {
        const props = this.props
        props.actions.toggleFlag(props.photo)
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
            this.props.setCurrentLeft
        );

        window.addEventListener(
            'detail:moveRight',
            this.props.setCurrentRight
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
            this.props.setCurrentLeft
        );

        window.removeEventListener(
            'detail:moveRight',
            this.props.setCurrentRight
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
                        <Button enabled={!props.isFirst} onClick={props.setCurrentLeft} tip="Previous image [left]">
                            <FaIcon name="arrow-left"/>
                        </Button>
                        <Button enabled={!props.isLast} onClick={props.setCurrentRight} tip="Next image [right]">
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
                        <Button
                            className={classNames('PictureDetail-toggleButton', { isActive: !!props.photo.flag })}
                            onClick={this.toggleFlagged}
                        >
                            <FaIcon name="flag" />
                        </Button>
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
