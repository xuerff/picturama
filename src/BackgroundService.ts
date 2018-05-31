import { BrowserWindow, ipcMain } from 'electron'

import { assertMainProcess } from './util/ElectronUtil'
import { fetchPhotoWork, storePhotoWork, storeThumbnail } from './PhotoWorkStore'
import { PhotoWork } from './models/Photo'


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
    if (action === 'fetchPhotoWork') {
        return fetchPhotoWork(params.photoPath)
    } else if (action === 'storePhotoWork') {
        return storePhotoWork(params.photoPath, params.photoWork)
    } else if (action === 'storeThumbnail') {
        return storeThumbnail(params.thumbnailPath, params.thumbnailData)
    } else {
        throw new Error('Unknown background action: ' + action)
    }
}
