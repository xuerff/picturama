import { BrowserWindow, ipcMain } from 'electron'

import { assertMainProcess } from '../common/util/ElectronUtil'
import { fetchPhotoWork, storePhotoWork, storeThumbnail } from './store/PhotoWorkStore'
import { fetchSections, updatePhotos, fetchPhotoDetail, fetchSectionPhotos } from './store/PhotoStore'
import { fetchTags, storePhotoTags } from './store/TagStore'


assertMainProcess()


let mainWindow: BrowserWindow | null = null


export function init(mainWin: BrowserWindow) {
    mainWindow = mainWin

    ipcMain.on('executeBackgroundAction', (event, callId, action, params) => {
        executeBackgroundAction(action, params)
            .then(result => {
                mainWindow.webContents.send('onBackgroundActionDone', callId, null, result)
            },
            error => {
                const msg = (error instanceof Error) ? error.message : error
                mainWindow.webContents.send('onBackgroundActionDone', callId, msg, null)
            })
    })
}

async function executeBackgroundAction(action: string, params: any): Promise<any> {
    if (action === 'fetchSections') {
        return fetchSections(params.filter)
    } else if (action === 'fetchSectionPhotos') {
        return fetchSectionPhotos(params.sectionId, params.filter)
    } else if (action === 'updatePhotos') {
        return updatePhotos(params.photoIds, params.update)
    } else if (action === 'fetchPhotoDetail') {
        return fetchPhotoDetail(params.photoId)
    } else if (action === 'fetchPhotoWork') {
        return fetchPhotoWork(params.photoPath)
    } else if (action === 'storePhotoWork') {
        return storePhotoWork(params.photoPath, params.photoWork)
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
