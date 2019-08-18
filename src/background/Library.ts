import fs from 'fs'
import { ipcMain, shell, BrowserWindow } from 'electron'
import DB from 'sqlite3-helper/no-generators'

import config from 'common/config'
import { PhotoId, Tag } from 'common/CommonTypes'
import { getMasterPath } from 'common/util/DataUtil'
import { bindMany } from 'common/util/LangUtil'

import ForegroundClient from 'background/ForegroundClient'
import { startImport } from 'background/ImportScanner'
import { deletePhotos } from 'background/store/PhotoStore'
import { removePhotoWork } from 'background/store/PhotoWorkStore'
import { fetchTags } from 'background/store/TagStore'


class Library {

    constructor() {
        bindMany(this, 'emptyTrash', 'scan')

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
            const photosToDelete = await DB().query<{ id: PhotoId, master_dir: string, master_filename: string }>(
                'select id, master_dir, master_filename from photos where trashed = 1')

            const photoIds = photosToDelete.map(photo => photo.id)

            const shouldFetchTags = await deletePhotos(photoIds)
            let updatedTags: Tag[] | null = null
            if (shouldFetchTags) {
                updatedTags = await fetchTags()
            }

            for (const photo of photosToDelete) {
                shell.moveItemToTrash(getMasterPath(photo))
            }

            await Promise.all(photosToDelete.map(photo => removePhotoWork(photo.master_dir, photo.master_filename)))

            await ForegroundClient.onPhotoTrashed(photoIds, updatedTags)
        })()
        .catch(error => {
            // TODO: Show error in UI
            console.error('Emptying trash failed', error)
        })
    }

    private scan() {
        startImport()
    }

}

export default Library
