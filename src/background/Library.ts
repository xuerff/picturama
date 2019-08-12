import fs from 'fs'
import { ipcMain, shell, BrowserWindow } from 'electron'
import DB from 'sqlite3-helper/no-generators'
import moment from 'moment'
import notifier from 'node-notifier'

import config from 'common/config'
import { PhotoId } from 'common/CommonTypes'
import { getThumbnailPath, getMasterPath } from 'common/util/DataUtil'
import { bindMany } from 'common/util/LangUtil'

import { removePhotoWork } from 'background/store/PhotoWorkStore'
import ImportScanner from 'background/ImportScanner'
import { fsUnlinkIfExists } from 'background/util/FileUtil'


class Library {

    private path: string | null = null
    private versionsPath: string | null = null


    constructor(private mainWindow: BrowserWindow) {
        bindMany(this, 'emptyTrash', 'scan')

        if (fs.existsSync(config.settings)) {
            let settings = JSON.parse(fs.readFileSync(config.settings)) as any

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

    // TODO: Revive Legacy code of 'version' feature
    /*
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
                    let versionName = version.master!.match(/\w+-[\wéè]+-\d.\w{1,5}$/)![0]
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
    */

    emptyTrash() {
        (async () => {
            const photosToDelete = await DB().query<{ id: PhotoId, master_dir: string, master_filename: string, non_raw: string }>(
                'select id, master_dir, master_filename, non_raw from photos where trashed = 1')
            for (const photo of photosToDelete) {
                await Promise.all([
                    shell.moveItemToTrash(getMasterPath(photo)),
                    fsUnlinkIfExists(photo.non_raw),
                    fsUnlinkIfExists(getThumbnailPath(photo.id)),
                    removePhotoWork(photo.master_dir, photo.master_filename)
                ])
            }

            const photoIds = photosToDelete.map(photo => photo.id)
            const photoIdsCsv = photoIds.join(',')
            await DB().run(`delete from versions where photo_id in (${photoIdsCsv})`)
            await DB().run(`delete from photos_tags where photo_id in (${photoIdsCsv})`)
            await DB().run(`delete from photos where id in (${photoIdsCsv})`)

            this.mainWindow.webContents.send('photos-trashed', photoIds)
        })()
        .catch(error => {
            // TODO: Show error in UI
            console.error('Emptying trash failed', error)
        })
    }

    scan() {
        const start = new Date().getTime()

        if (!this.path || !this.versionsPath) {
            return false
        }
        new ImportScanner(this.path, this.versionsPath, this.mainWindow)
            .scanPictures()
            .then(photoCount => {
                let end = new Date().getTime()
                let time = moment.duration(end - start)

                if (photoCount !== null) {
                    const message = `Finish importing ${photoCount} photos in ${time.humanize()}`
                    console.log(message)
                    notifier.notify({
                        title: 'Ansel',
                        message
                    })
                }
            })
            .catch(error => {
                // TODO: Show error in UI
                console.error('Scanning for pictures failed', error)
            })
    }

}

export default Library
