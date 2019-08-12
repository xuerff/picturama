import { BrowserWindow, ipcMain } from 'electron'

import { UiConfig } from 'common/CommonTypes'
import { assertMainProcess } from 'common/util/ElectronUtil'

import { fetchPhotoWork, storePhotoWork, storeThumbnail } from 'background/store/PhotoWorkStore'
import { fetchTotalPhotoCount, fetchSections, updatePhotos, fetchPhotoDetail, fetchSectionPhotos } from 'background/store/PhotoStore'
import { fetchTags, storePhotoTags } from 'background/store/TagStore'
import { fsStat } from 'background/util/FileUtil'


assertMainProcess()


let uiConfig: UiConfig


export function init(mainWin: BrowserWindow, newUiConfig: UiConfig) {
    uiConfig = newUiConfig

    ipcMain.on('executeBackgroundAction', (event, callId, action, params) => {
        executeBackgroundAction(action, params)
            .then(result => {
                mainWin.webContents.send('onBackgroundActionDone', callId, null, result)
            },
            error => {
                const msg = (error instanceof Error) ? error.message : error
                mainWin.webContents.send('onBackgroundActionDone', callId, msg, null)
            })
    })
}

async function executeBackgroundAction(action: string, params: any): Promise<any> {
    if (action === 'fetchUiConfig') {
        return Promise.resolve(uiConfig)
    } else if (action === 'getFileSize') {
        const stat = await fsStat(params.path)
        return stat.size
    } else if (action === 'fetchTotalPhotoCount') {
        return fetchTotalPhotoCount()
    } else if (action === 'fetchSections') {
        return fetchSections(params.filter)
    } else if (action === 'fetchSectionPhotos') {
        return fetchSectionPhotos(params.sectionId, params.filter)
    } else if (action === 'updatePhotos') {
        return updatePhotos(params.photoIds, params.update)
    } else if (action === 'fetchPhotoDetail') {
        return fetchPhotoDetail(params.photoId)
    } else if (action === 'fetchPhotoWork') {
        return fetchPhotoWork(params.photoDir, params.photoFileName)
    } else if (action === 'storePhotoWork') {
        return storePhotoWork(params.photoDir, params.photoFileName, params.photoWork)
    } else if (action === 'storeThumbnail') {
        return storeThumbnail(params.thumbnailPath, params.thumbnailData)
    } else if (action === 'fetchTags') {
        return fetchTags()
    } else if (action === 'storePhotoTags') {
        return storePhotoTags(params.photoId, params.photoTags)
    } else {
        throw new Error('Unknown background action: ' + action)
    }
}
