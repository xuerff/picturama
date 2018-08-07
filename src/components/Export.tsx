import { remote } from 'electron'
import * as fs from 'fs'
import * as Promise from 'bluebird'
import * as notifier from 'node-notifier'
import * as libraw from 'libraw'
import * as sharp from 'sharp'
import * as React from 'react'
import { findDOMNode } from 'react-dom'

import keymapManager from '../keymap-manager'
import config from '../config'
import Progress from './progress'
import { PhotoType } from '../models/Photo'
import { bindMany } from '../util/LangUtil'

const readFile = Promise.promisify(fs.readFile)


interface Props {
    photos: PhotoType[]
    actions: any
}

interface State {
    folder: string
    quality: number
    format: string
    showProgress: boolean
}

declare global {
    namespace sharp {
        interface SharpInstance {
            quality()
        }
    }
}

class Export extends React.Component<Props, State> {

    constructor(props) {
        super(props)

        bindMany(this, 'onEachPhoto', 'processImg')

        this.state = {
            folder: null,
            quality: 90,
            format: config.exportFormats[0],
            showProgress: false
        }

        this.onEachPhoto = this.onEachPhoto.bind(this)
        this.processImg = this.processImg.bind(this)
    }

    componentDidMount() {
        keymapManager.bind(this.refs.main)
        window.addEventListener('core:cancel', this.props.actions.closeExport)
    }

    componentWillUnmount() {
        keymapManager.unbind()
        window.removeEventListener('core:cancel', this.props.actions.closeExport)
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

        this.props.actions.closeExport()
    }

    onEachPhoto(photo, i) {
        let extension = photo.extension.toLowerCase()

        if (!this.state.folder)
            return false

        this.props.actions.importProgress(null, {
            processed: i + 1,
            total: this.props.photos.length,
            photosDir: this.state.folder
        })

        if (photo.versions.length > 0)
            return this.processImg(photo, photo.thumb)

        if (config.acceptedRawFormats.indexOf(extension) !== -1) {
            return libraw.extract(photo.master, `${config.tmp}/${photo.title}`)
                .then(imgPath => readFile(imgPath))
                .then(img => this.processImg(photo, img))
        }

        return this.processImg(photo, photo.thumb)
    }

    handleSubmit(e) {
        e.preventDefault()

        this.setState({ showProgress: true })

        Promise.each(this.props.photos, this.onEachPhoto)
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
            <div className="outer-modal" ref="main">
                <div className="modal shadow--2dp">
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

                    {this.state.showProgress ? <Progress /> : null}
                </div>
            </div>
        )
    }
}

export default Export
