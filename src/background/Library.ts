import { ipcMain, shell, BrowserWindow } from 'electron'
import moment from 'moment'
import notifier from 'node-notifier'
import fs from 'fs'
import Promise from 'bluebird'

import Scanner from './Scanner'
import config from '../common/config'

import Photo, { getThumbnailPath } from '../common/models/Photo'
import Version from '../common/models/Version'


class Library {

    private mainWindow: BrowserWindow
    private path: string | null = null
    private versionsPath: string | null = null


    constructor(mainWindow: BrowserWindow) {
        this.mainWindow = mainWindow

        this.scan = this.scan.bind(this)
        this.emptyTrash = this.emptyTrash.bind(this)
        this.fixMissingVersions = this.fixMissingVersions.bind(this)

        if (fs.existsSync(config.settings)) {
            let settings = require(config.settings) as any

            this.path = settings.directories.photos
            this.versionsPath = settings.directories.versions

            if (!fs.existsSync(config.nonRawPath)) {
                fs.mkdirSync(config.nonRawPath)
            }

            if (!fs.existsSync(config.thumbnailPath)) {
                fs.mkdirSync(config.thumbnailPath)
            }
        }

        if (!fs.existsSync(config.tmp)) {
            fs.mkdirSync(config.tmp)
        }

        ipcMain.on('start-scanning', this.scan)
        ipcMain.on('empty-trash', this.emptyTrash)
    }

    fixMissingVersions() {
        Version
            .query(qb =>
                qb
                    .innerJoin('photos', 'versions.photo_id', 'photos.id')
                    .where('output', null)
                    .orWhere('thumbnail', null)
            )
            .fetchAll()
            .then(versions => {
                versions.toJSON().forEach(version => {
                    let versionName = version.master.match(/\w+-[\wéè]+-\d.\w{1,5}$/)[0]
                    let outputPath = `${this.versionsPath}/${versionName}`

                    if (fs.existsSync(outputPath)) {
                        // TODO: regenerate thumbnail
                        new Version({ id: version.id })
                            .save('output', outputPath, { patch: true })
                            .then(() => {
                                (Version as any).updateImage(outputPath.match(config.watchedFormats))
                            })
                    } else {
                        new Version({ id: version.id })
                            .destroy()
                            .catch(err => console.error('error while destroying', err))
                    }
                })
            })
    }

    emptyTrash() {
        new Photo()
            .where({ trashed: 1 })
            .fetchAll({ withRelated: [ 'versions', 'tags' ] })
            .then(photos => photos.toJSON())
            .map(photo =>
                Promise.each(
                    [ photo.master, photo.non_raw, getThumbnailPath(photo.id) ],
                    imgPath => {
                        if (imgPath) {
                            shell.moveItemToTrash(imgPath)
                        }
                    }
                )
                .then(() => new Photo({ id: photo.id })
                    .destroy()
                )
                .then(() => photo)
            )
            .then(photos => {
                this.mainWindow.webContents.send(
                    'photos-trashed',
                    photos.map(photo => photo.id)
                )
            })
    }

    scan() {
        const start = new Date().getTime()

        this.mainWindow.webContents.send('start-import', true)

        if (!this.path || !this.versionsPath)
            return false
        new Scanner(this.path, this.versionsPath, this.mainWindow)
            .scanPictures()
            .then(pics => {
                let end = new Date().getTime()
                let time = moment.duration(end - start)

                this.mainWindow.webContents.send('finish-import', true)

                notifier.notify({
                    title: 'Ansel',
                    message: `Finish importing ${pics.length} in ${time.humanize()}`
                })
            })
            .catch(error => {
                // TODO: Show error in UI
                console.error('Scanning for pictures failed', error)
            })

        notifier.notify({
            title: 'Ansel',
            message: 'Start import'
        })
    }

}

export default Library
