import { ipcMain, shell, BrowserWindow } from 'electron'
import moment from 'moment'
import notifier from 'node-notifier'
import fs from 'fs'
import Promise from 'bluebird'

import Scanner from './Scanner'
import config from '../common/config'
import { readMetadataOfImage } from './MetaData'

import walker from './lib/walker'

import Tag from '../common/models/Tag'
import Photo, { PhotoType, getThumbnailPath } from '../common/models/Photo'
import Version from '../common/models/Version'


class Library {

    private mainWindow: BrowserWindow
    private path: string | null = null
    private versionsPath: string | null = null


    constructor(mainWindow: BrowserWindow) {
        this.mainWindow = mainWindow

        this.scanForTags = this.scanForTags.bind(this)
        this.scan = this.scan.bind(this)
        this.emptyTrash = this.emptyTrash.bind(this)
        this.fixMissingVersions = this.fixMissingVersions.bind(this)

        if (fs.existsSync(config.settings)) {
            let settings = require(config.settings) as any

            this.path = settings.directories.photos
            this.versionsPath = settings.directories.versions

            if (!fs.existsSync(config.thumbsPath))
                fs.mkdirSync(config.thumbsPath)

            if (!fs.existsSync(config.thumbs250Path))
                fs.mkdirSync(config.thumbs250Path)
        }

        if (!fs.existsSync(config.tmp))
            fs.mkdirSync(config.tmp)

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
                    [ photo.master, photo.thumb, getThumbnailPath(photo.id) ],
                    imgPath => shell.moveItemToTrash(imgPath)
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

    walkForTags(file) {
        return readMetadataOfImage(file.path)
            .then(metaData => {
                if (metaData.tags.length > 0)
                    return metaData.tags

                throw 'no-tag'
            })
            .each(tagName => new Tag({ title: tagName })
                .fetch()
                .then(tag => {
                    if (tag)
                        return tag

                    return new Tag({ title: tagName }).save()
                })
            )
            .catch(() => false)
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

    scanForTags() {
        const start = new Date().getTime()

        this.mainWindow.webContents.send('start-import', true)

        if (!this.path || !this.versionsPath)
            return false

        walker(this.path, [ this.versionsPath ])
            .then((this as any).prepare.bind(this))
            .then((this as any).setTotal.bind(this))
            .map(this.walkForTags.bind(this), {
                concurrency: config.concurrency
            })
            .then(pics => {
                let end = new Date().getTime()
                let time = moment.duration(end - start)

                this.mainWindow.webContents.send('finish-import', true)

                notifier.notify({
                    title: 'Ansel',
                    message: `Finish importing tags ${pics.length} in ${time.humanize()}`
                })
            })

        notifier.notify({
            title: 'Ansel',
            message: 'Start import'
        })
    }
}

export default Library
