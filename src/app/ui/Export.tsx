import { remote } from 'electron'
import BluebirdPromise from 'bluebird'
import notifier from 'node-notifier'
import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'

import { PhotoId, PhotoById, LoadedPhotoSection, PhotoRenderFormat, photoRenderFormats } from 'common/CommonTypes'
import { bindMany } from 'common/util/LangUtil'

import BackgroundClient from 'app/BackgroundClient'
import { CommandGroupId, addCommandGroup, removeCommandGroup } from 'app/controller/HotkeyController'
import { closeExportAction } from 'app/state/actions'
import { AppState } from 'app/state/StateTypes'
import { showError } from 'app/ErrorPresenter'

import Progress from './Progress'


interface OwnProps {
    style?: any
}

interface StateProps {
    photoIds: PhotoId[]
    photoData: PhotoById
}

interface DispatchProps {
    closeExport: () => void
}

export interface Props extends OwnProps, StateProps, DispatchProps {
}

interface State {
    folder: string | null
    quality: number
    format: PhotoRenderFormat
    progress: { processed: number, total: number, photosDir: string } | null
}

export class Export extends React.Component<Props, State> {

    private commandGroupId: CommandGroupId

    constructor(props: Props) {
        super(props)
        bindMany(this, 'onEachPhoto')
        this.state = {
            folder: null,
            quality: 90,
            format: photoRenderFormats[0],
            progress: null
        }
    }

    componentDidMount() {
        this.commandGroupId = addCommandGroup([
            { combo: 'esc', onAction: this.props.closeExport }
        ])
    }

    componentWillUnmount() {
        removeCommandGroup(this.commandGroupId)
    }

    onFolderSelection(filenames: string[]) {
        this.setState({ folder: filenames[0] })
    }

    openFolderDialog(e) {
        e.preventDefault()

        remote.dialog.showOpenDialog(
            { properties: [ 'openDirectory' ] },
            this.onFolderSelection.bind(this)
        )
    }

    afterExport() {
        notifier.notify({
            title: 'Ansel',
            message: `Finish exporting ${this.props.photoIds.length} photo(s)`
        })

        this.props.closeExport()
    }

    async onEachPhoto(photoId: PhotoId, i: number) {
        const { props, state } = this
        const photo = props.photoData[photoId]

        if (!state.folder)
            return false

        this.setState({
            progress: {
                processed: i + 1,
                total: props.photoIds.length,
                photosDir: state.folder
            }
        })

        return BackgroundClient.exportPhoto(photo, state.folder, { format: state.format, quality: state.quality })
    }

    handleSubmit(e) {
        e.preventDefault()

        BluebirdPromise.each(this.props.photoIds, this.onEachPhoto)
            .then(this.afterExport.bind(this))
            .catch(error => showError('Export failed', error))
    }

    updateQuality() {
        const qualityElem = findDOMNode(this.refs.quality) as HTMLInputElement
        this.setState({ quality: parseInt(qualityElem.value) })
    }

    updateFormat() {
        const formatElem = findDOMNode(this.refs.format) as HTMLSelectElement
        this.setState({ format: formatElem.value as PhotoRenderFormat })
    }

    render() {
        let formats = photoRenderFormats
            .map((exportFormat, i) => <option key={i} value={exportFormat}>{exportFormat}</option>)

        return (
            <div className="ansel-outer-modal" style={this.props.style}>
                <div className="ansel-modal shadow--2dp">
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <div>
                            <label htmlFor="format">Format:</label>

                            <select
                                id="format"
                                ref="format"
                                value={this.state.format}
                                onChange={this.updateFormat.bind(this)}>{formats}</select>
                        </div>

                        <div>
                            <label htmlFor="quality">Quality</label>

                            <input
                                type="range"
                                id="quality"
                                ref="quality"
                                min="10"
                                max="100"
                                value={this.state.quality}
                                onChange={this.updateQuality.bind(this)}
                                step="1" />

                            {this.state.quality}
                        </div>

                        <div>
                            <label htmlFor="folder">Folder:</label>

                            <button id="folder" onClick={this.openFolderDialog.bind(this)}>
                                export to: {this.state.folder}
                            </button>
                        </div>

                        <button>Save</button>
                    </form>

                    {this.state.progress &&
                        <Progress progress={this.state.progress} />
                    }
                </div>
            </div>
        )
    }
}


const Connected = connect<StateProps, DispatchProps, OwnProps, AppState>(
    (state: AppState, props) => {
        return {
            ...props,
            photoIds: state.export!.photoIds,
            photoData: (state.data.sections.byId[state.export!.sectionId] as LoadedPhotoSection).photoData
        }
    },
    {
        closeExport: closeExportAction
    }
)(Export)

export default Connected
