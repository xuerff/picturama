import { ipcRenderer } from 'electron'

import { Device } from 'common/models/DataTypes'
import { PhotoId } from 'common/models/Photo'
import { TagType } from 'common/models/Tag'
import { assertRendererProcess } from 'common/util/ElectronUtil'
import { ImportProgress } from 'common/CommonTypes'

import { fetchSections, fetchTotalPhotoCount, updatePhotoVersion } from 'ui/controller/PhotoController'
import { setTags } from 'ui/controller/PhotoTagController'
import { initDevicesAction, addDeviceAction, removeDeviceAction, emptyTrashAction, setImportProgressAction } from 'ui/state/actions'
import store from 'ui/state/store'


assertRendererProcess()


/** The interval in which to update the library grid while running an import (in ms) */
const importUiUpdateInterval = 10000
let prevImportUiUpdateTime = 0


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

    ipcRenderer.on('new-version', (event, version: any /* Type should be `Version`, but it doesn't work */) => updatePhotoVersion(version))
    ipcRenderer.on('scanned-devices', (event, devices: Device[]) => store.dispatch(initDevicesAction(devices)))
    ipcRenderer.on('add-device', (event, device: Device) => store.dispatch(addDeviceAction(device)))
    ipcRenderer.on('remove-device', (event, device: Device) => store.dispatch(removeDeviceAction(device)))
    ipcRenderer.on('photos-trashed', (event, photoIds: PhotoId[]) => store.dispatch(emptyTrashAction(photoIds)))
}


async function executeForegroundAction(action: string, params: any): Promise<any> {
    if (action === 'setImportProgress') {
        const { progress, updatedTags } = params as { progress: ImportProgress | null, updatedTags: TagType[] | null }

        store.dispatch(setImportProgressAction(progress))

        const isImportFinished = !progress
        const now = Date.now()
        if (isImportFinished || now > prevImportUiUpdateTime + importUiUpdateInterval) {
            prevImportUiUpdateTime = now
            fetchTotalPhotoCount()
            fetchSections()
        }

        if (updatedTags) {
            setTags(updatedTags)
        }

        return Promise.resolve()
    } else {
        throw new Error('Unknown foreground action: ' + action)
    }
}
