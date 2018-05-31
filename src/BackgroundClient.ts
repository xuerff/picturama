import { BrowserWindow, ipcRenderer } from 'electron'

import { PhotoWork } from './models/Photo'
import { assertRendererProcess } from './util/ElectronUtil'


assertRendererProcess()


// We used to use electron.require for this, but it was too buggy.
// (I passed a value to an IPC stub and the other side got a value from a previous call)


interface CallInfo {
    resolve(result: any)
    reject(error: any)
}


let nextCallId = 1
const pendingCalls: { [key:number]: CallInfo } = {}


export function init() {
    ipcRenderer.on('onBackgroundActionDone', (event, callId, error, result) => {
        const callInfo = pendingCalls[callId]
        delete pendingCalls[callId]
        if (callInfo) {
            if (error) {
                callInfo.reject(error)
            } else {
                callInfo.resolve(result)
            }
        }
    })
}


async function callOnBackground(action: string, params: any): Promise<any> {
    const callId = nextCallId++

    return new Promise<any>((resolve, reject) => {
        pendingCalls[callId] = { resolve, reject }
        ipcRenderer.send('executeBackgroundAction', callId, action, params)
    })
}


export async function fetchPhotoWork(photoPath: string): Promise<PhotoWork> {
    return callOnBackground('fetchPhotoWork', { photoPath })
}


// storePhotoWork is not exported, since it shouldn't be called directly (see storePhotoWorkUpdate)
async function storePhotoWork(photoPath: string, photoWork: PhotoWork): Promise<void> {
    return callOnBackground('storePhotoWork', { photoPath, photoWork })
}


const pendingUpdates: { updates: ((photoWork: PhotoWork) => void)[], promise: Promise<void> }[] = []

/**
 * Updates and stores the work on a photo.
 *
 * Lost updates are prevented, since fetch and store will be synchronized for each photo.
 */
export async function storePhotoWorkUpdate(photoPath: string, update: (photoWork: PhotoWork) => void): Promise<void> {
    let pendingUpdate = pendingUpdates[photoPath]
    if (pendingUpdate) {
        pendingUpdate.updates.push(update)
    } else {
        pendingUpdate = {
            updates: [ update ],
            promise: fetchPhotoWork(photoPath)
                .then(photoWork => {
                    for (const up of pendingUpdate.updates) {
                        up(photoWork)
                    }
                    delete pendingUpdates[photoPath]
                    return storePhotoWork(photoPath, photoWork)
                })
                .catch(error => {
                    delete pendingUpdates[photoPath]
                    throw error
                })
        }
        pendingUpdates[photoPath] = pendingUpdate
    }
    return pendingUpdate.promise
}


export async function storeThumbnail(thumbnailPath: string, thumbnailData: string): Promise<void> {
    return callOnBackground('storeThumbnail', { thumbnailPath, thumbnailData })
}
