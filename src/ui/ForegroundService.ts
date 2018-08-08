import { ipcRenderer } from 'electron'

import { profileThumbnailRenderer } from '../common/LogConstants'
import { fetchDates } from './data/PhotoDateStore'
import { fetchTotalPhotoCount, fetchPhotos, updatePhotoVersion } from './data/PhotoStore'
import { fetchTags } from './data/PhotoTagStore'
import { Device } from '../common/models/DataTypes'
import { PhotoId } from '../common/models/Photo'
import Version from '../common/models/Version'
import { renderThumbnail } from './renderer/ThumbnailRenderer'
import { initDevicesAction, addDeviceAction, removeDeviceAction, emptyTrashAction, startImportAction, setImportProgressAction } from './state/actions'
import store from './state/store'
import { assertRendererProcess } from '../common/util/ElectronUtil'
import Profiler from '../common/util/Profiler'
import { ImportProgress } from './state/reducers/import'


assertRendererProcess()


export function init() {
    ipcRenderer.on('executeForegroundAction', (event, callId, action, params) => {
        executeForegroundAction(action, params)
            .then(result => {
                ipcRenderer.send('onForegroundActionDone', callId, null, result)
            },
            error => {
                const msg = (error instanceof Error) ? error.message : error
                ipcRenderer.send('onForegroundActionDone', callId, msg, null)
            })
    })

    ipcRenderer.on('start-import', () => store.dispatch(startImportAction()))
    ipcRenderer.on('progress', (event, progress: ImportProgress) => store.dispatch(setImportProgressAction(progress)))

    ipcRenderer.on('finish-import', () => {
        fetchTotalPhotoCount()
        fetchPhotos()
        fetchDates()
        fetchTags()
    })

    ipcRenderer.on('new-version', (event, version: any /* Type should be `Version`, but it doesn't work */) => updatePhotoVersion(version))
    ipcRenderer.on('scanned-devices', (event, devices: Device[]) => store.dispatch(initDevicesAction(devices)))
    ipcRenderer.on('add-device', (event, device: Device) => store.dispatch(addDeviceAction(device)))
    ipcRenderer.on('remove-device', (event, device: Device) => store.dispatch(removeDeviceAction(device)))
    ipcRenderer.on('photos-trashed', (event, photoIds: PhotoId[]) => store.dispatch(emptyTrashAction(photoIds)))
}


async function executeForegroundAction(action: string, params: any): Promise<any> {
    if (action === 'renderThumbnail') {
        const profiler = profileThumbnailRenderer ? new Profiler(`Rendering thumbail of ${params.photoPath}`) : null
        return renderThumbnail(params.photoPath, params.orientation, params.photoWork, profiler)
            .then(result => {
                if (profiler) profiler.logResult()
                return result
            })
    } else {
        throw new Error('Unknown foreground action: ' + action)
    }
}
