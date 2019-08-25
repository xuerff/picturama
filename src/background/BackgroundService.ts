import { BrowserWindow, ipcMain, dialog } from 'electron'

import { UiConfig } from 'common/CommonTypes'
import { assertMainProcess } from 'common/util/ElectronUtil'

import AppWindowController from 'background/AppWindowController'
import { startImport } from 'background/ImportScanner'
import { fetchPhotoWork, storePhotoWork, storeThumbnail } from 'background/store/PhotoWorkStore'
import { fetchTotalPhotoCount, fetchSections, updatePhotos, fetchPhotoDetail, fetchSectionPhotos, emptyTrash } from 'background/store/PhotoStore'
import { fetchSettings, storeSettings } from 'background/store/SettingsStore'
import { fetchTags, storePhotoTags } from 'background/store/TagStore'
import { fsStat } from 'background/util/FileUtil'


assertMainProcess()


let uiConfig: UiConfig

let resolveBackgroundReady: () => void
const waitForBackgroundReadyPromise = new Promise(resolve => resolveBackgroundReady = resolve)


export function init(mainWin: BrowserWindow, newUiConfig: UiConfig) {
    uiConfig = newUiConfig

    ipcMain.on('start-scanning', startImport)
    ipcMain.on('empty-trash', () => {
        emptyTrash()
            .catch(error => {
                // TODO: Show error in UI
                console.error('Emptying trash failed', error)
            })
    })

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

export function onBackgroundReady() {
    resolveBackgroundReady()
}

async function executeBackgroundAction(action: string, params: any): Promise<any> {
    if (action === 'waitForBackgroundReady') {
        return waitForBackgroundReadyPromise
    } else if (action === 'toggleFullScreen') {
        AppWindowController.toggleFullScreen()
    } else if (action === 'fetchUiConfig') {
        return Promise.resolve(uiConfig)
    } else if (action === 'fetchSettings') {
        return fetchSettings()
    } else if (action === 'storeSettings') {
        await storeSettings(params.settings)
    } else if (action === 'getFileSize') {
        const stat = await fsStat(params.path)
        return stat.size
    } else if (action === 'selectDirectories') {
        return new Promise(resolve =>
            dialog.showOpenDialog(AppWindowController.getAppWindow(), { properties: [ 'openDirectory' ] }, resolve)
        )
    } else if (action === 'startImport') {
        startImport()
    } else if (action === 'fetchTotalPhotoCount') {
        return fetchTotalPhotoCount()
    } else if (action === 'fetchSections') {
        return fetchSections(params.filter, params.sectionIdsToKeepLoaded)
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
        const shouldFetchTags = await storePhotoTags(params.photoId, params.photoTags)
        return shouldFetchTags ? (await fetchTags()) : null
    } else {
        throw new Error('Unknown background action: ' + action)
    }
}
