import { ipcRenderer } from 'electron'

import { PhotoId, PhotoType, PhotoDetail, PhotoWork, PhotoFilter, PhotoSection, PhotoSectionId } from '../common/models/Photo'
import { assertRendererProcess } from '../common/util/ElectronUtil'


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


export async function fetchSections(filter: PhotoFilter): Promise<PhotoSection[]> {
    return callOnBackground('fetchSections', { filter })
}

export async function fetchSectionPhotos(sectionId: PhotoSectionId, filter: PhotoFilter): Promise<PhotoType[]> {
    return callOnBackground('fetchSectionPhotos', { sectionId, filter })
}

export async function updatePhotos(photoIds: PhotoId[], update: Partial<PhotoType>): Promise<void> {
    return callOnBackground('updatePhotos', { photoIds, update })
}

export async function fetchPhotoDetail(photoId: PhotoId): Promise<PhotoDetail> {
    return callOnBackground('fetchPhotoDetail', { photoId })
}

export async function fetchPhotoWork(photoPath: string): Promise<PhotoWork> {
    return callOnBackground('fetchPhotoWork', { photoPath })
}

export async function storePhotoWork(photoPath: string, photoWork: PhotoWork): Promise<void> {
    return callOnBackground('storePhotoWork', { photoPath, photoWork })
}

export async function storeThumbnail(thumbnailPath: string, thumbnailData: string): Promise<void> {
    return callOnBackground('storeThumbnail', { thumbnailPath, thumbnailData })
}
