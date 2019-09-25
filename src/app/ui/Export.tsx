import { remote } from 'electron'
import fs from 'fs'
import BluebirdPromise from 'bluebird'
import notifier from 'node-notifier'
import sharp from 'sharp'
import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'

import { PhotoId, PhotoById, LoadedPhotoSection, Photo } from 'common/CommonTypes'
import config from 'common/config'
import { getNonRawPath, getMasterPath } from 'common/util/DataUtil'
import { bindMany } from 'common/util/LangUtil'
import { parsePath } from 'common/util/TextUtil'

import BackgroundClient from 'app/BackgroundClient'
import { CommandGroupId, addCommandGroup, removeCommandGroup } from 'app/controller/HotkeyController'
import { closeExportAction } from 'app/state/actions'
import { AppState } from 'app/state/StateTypes'

import Progress from './Progress'


const fsReadFile = BluebirdPromise.promisify(fs.readFile)

let libraw: any | false | null = null


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
    format: string
    progress: { processed: number, total: number, photosDir: string } | null
}

export class Export extends React.Component<Props, State> {

    private commandGroupId: CommandGroupId

    constructor(props: Props) {
        super(props)

        bindMany(this, 'onEachPhoto', 'processImg')

        this.state = {
            folder: null,
            quality: 90,
            format: config.exportFormats[0],
            progress: null
        }

        this.onEachPhoto = this.onEachPhoto.bind(this)
        this.processImg = this.processImg.bind(this)
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

    processImg(photo: Photo, source) {
        const sharpObject = sharp(source)
            .rotate()
            .withMetadata()

        switch(this.state.format) {
            case 'png': sharpObject.png({ quality: this.state.quality }); break
            case 'webp': sharpObject.webp({ quality: this.state.quality }); break
            default: sharpObject.jpeg({ quality: this.state.quality }); break
        }

        const filenameParts = parsePath(photo.master_filename)
        sharpObject.toFile(`${this.state.folder}/${filenameParts.name}.${this.state.format}`)
    }

    afterExport() {
        notifier.notify({
            title: 'Ansel',
            message: `Finish exporting ${this.props.photoIds.length} photo(s)`
        })

        this.props.closeExport()
    }

    async onEachPhoto(photoId: PhotoId, i: number) {
        const photo = this.props.photoData[photoId]

        const pathParts = parsePath(photo.master_filename)
        const extension = pathParts.ext.toLowerCase()

        if (!this.state.folder)
            return false

        this.setState({
            progress: {
                processed: i + 1,
                total: this.props.photoIds.length,
                photosDir: this.state.folder
            }
        })

        const photoDetail = await BackgroundClient.fetchPhotoDetail(photoId)
        if (photoDetail.versions.length > 0) {
            const last = photoDetail.versions[photoDetail.versions.length - 1]
            return this.processImg(photo, last.output)
        }

        if (config.acceptedRawExtensions.indexOf(extension) !== -1) {
            if (libraw !== false) {
                if (!libraw) {
                    try {
                        libraw = require('libraw')
                    } catch (error) {
                        libraw = false
                        console.log('libraw is not supported', error)
                    }
                }
                if (libraw) {
                    return libraw.extract(getMasterPath(photo), `${config.tmp}/ansel-export-temp-${photo.id}`)
                        .then(imgPath => fsReadFile(imgPath))
                        .then(img => this.processImg(photo, img))
                }
            }
        }

        return this.processImg(photo, getNonRawPath(photo))
    }

    handleSubmit(e) {
        e.preventDefault()

        BluebirdPromise.each(this.props.photoIds, this.onEachPhoto)
            .then(this.afterExport.bind(this))
    }

    updateQuality() {
        const qualityElem = findDOMNode(this.refs.quality) as HTMLInputElement
        this.setState({ quality: parseInt(qualityElem.value) })
    }

    updateFormat() {
        const formatElem = findDOMNode(this.refs.format) as HTMLSelectElement
        this.setState({ format: formatElem.value })
    }

    render() {
        let formats = config.exportFormats
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
