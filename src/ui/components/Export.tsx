import { remote } from 'electron'
import fs from 'fs'
import BluebirdPromise from 'bluebird'
import notifier from 'node-notifier'
import libraw from 'libraw'
import sharp from 'sharp'
import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'

import { PhotoId, PhotoById } from 'common/CommonTypes'
import config from 'common/config'
import { bindMany } from 'common/util/LangUtil'

import BackgroundClient from 'ui/BackgroundClient'
import keymapManager from 'ui/keymap-manager'
import { getNonRawImgPath } from 'ui/controller/ImageProvider'
import { closeExportAction } from 'ui/state/actions'
import { AppState } from 'ui/state/reducers'

import Progress from './Progress'


const readFile = BluebirdPromise.promisify(fs.readFile)


interface OwnProps {
    style?: any
}

interface StateProps {
    photoIds: PhotoId[]
    photos: PhotoById
}

interface DispatchProps {
    closeExport: () => void
}

interface Props extends OwnProps, StateProps, DispatchProps {
}

interface State {
    folder: string | null
    quality: number
    format: string
    progress: { processed: number, total: number, photosDir: string } | null
}

export class Export extends React.Component<Props, State> {

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
        keymapManager.bind(this.refs.main)
        window.addEventListener('core:cancel', this.props.closeExport)
    }

    componentWillUnmount() {
        keymapManager.unbind()
        window.removeEventListener('core:cancel', this.props.closeExport)
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

    processImg(photo, source) {
        return (sharp(source)
            .rotate()
            .withMetadata() as any)
            .quality(this.state.quality)
            .toFile(`${this.state.folder}/${photo.title}.${this.state.format}`)
    }

    afterExport() {
        notifier.notify({
            title: 'Ansel',
            message: `Finish exporting ${this.props.photos.length} photo(s)`
        })

        this.props.closeExport()
    }

    async onEachPhoto(photoId: PhotoId, i: number) {
        const photo = this.props.photos[photoId]

        let extension = photo.extension.toLowerCase()

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

        if (config.acceptedRawFormats.indexOf(extension) !== -1) {
            return libraw.extract(photo.master, `${config.tmp}/${photo.title}`)
                .then(imgPath => readFile(imgPath))
                .then(img => this.processImg(photo, img))
        }

        return this.processImg(photo, getNonRawImgPath(photo))
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
            <div className="ansel-outer-modal" ref="main" style={this.props.style}>
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
            photos: state.data.sections.byId[state.export!.sectionId].photoData!
        }
    },
    {
        closeExport: closeExportAction
    }
)(Export)

export default Connected
