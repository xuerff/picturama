import { ipcRenderer, remote, Menu as MenuType } from 'electron';
import * as classNames from 'classnames'
import * as React from 'react'
import * as Loader from 'react-loader'

import keymapManager from '../../keymap-manager'
import createVersionAndOpenWith from '../../create-version'
import AvailableEditors from '../../available-editors'

import AddTags from '../add-tags';
import Export from '../export';
import PictureInfo from './PictureInfo'
import { PhotoType } from '../../models/Photo'

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
    isLast: () => boolean
    photo: PhotoType
}

interface State {
    bound: boolean,
    modal: 'addTags' | 'none' | 'export',
    loaded: boolean
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
        this.setState({ ...this.state, modal: 'addTags' });
    }

    closeDialog() {
        this.bindEventListeners();
        this.setState({ ...this.state, modal: 'none' });
    }

    showExportDialog() {
        this.unbindEventListeners();
        this.setState({ ...this.state, modal: 'export' });
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

    finishLoading() {
        this.setState({ ...this.state, loaded: true });
    }

    componentWillReceiveProps() {
        this.bindEventListeners();
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
        this.setState({ ...this.state, bound: true });

        document.addEventListener('contextmenu', this.contextMenu);

        ipcRenderer.send('toggleAddTagMenu', true);
        ipcRenderer.send('toggleExportMenu', true);

        ipcRenderer.on('addTagClicked', this.showTagDialog.bind(this));
    }

    unbindEventListeners() {
        this.setState({ ...this.state, bound: false });

        document.removeEventListener('contextmenu', this.contextMenu);

        ipcRenderer.send('toggleAddTagMenu', false);
        ipcRenderer.send('toggleExportMenu', false);

        ipcRenderer.removeAllListeners('addTagClicked');
    }

    render() {
        const props = this.props

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
                <div className="PictureDetail-body">
                    <img
                        className={imgClass}
                        src={props.photo.thumb}
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
