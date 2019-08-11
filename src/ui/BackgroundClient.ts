import { ipcRenderer } from 'electron'

import { UiConfig } from 'common/CommonTypes'
import { PhotoId, PhotoType, PhotoDetail, PhotoWork, PhotoFilter, PhotoSection, PhotoSectionId } from 'common/models/Photo'
import { TagType } from 'common/models/Tag'
import { assertRendererProcess } from 'common/util/ElectronUtil'


assertRendererProcess()


// We used to use electron.require for this, but it was too buggy.
// (I passed a value to an IPC stub and the other side got a value from a previous call)


interface CallInfo {
    resolve(result: any)
    reject(error: any)
}


let nextCallId = 1
const pendingCalls: { [key:number]: CallInfo } = {}


export default {

    init() {
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
    },

    fetchUiConfig(): Promise<UiConfig> {
        return callOnBackground('fetchUiConfig')
    },

    fetchSections(filter: PhotoFilter): Promise<PhotoSection[]> {
        return callOnBackground('fetchSections', { filter })
    },

    fetchSectionPhotos(sectionId: PhotoSectionId, filter: PhotoFilter): Promise<PhotoType[]> {
        return callOnBackground('fetchSectionPhotos', { sectionId, filter })
    },

    updatePhotos(photoIds: PhotoId[], update: Partial<PhotoType>): Promise<void> {
        return callOnBackground('updatePhotos', { photoIds, update })
    },

    fetchPhotoDetail(photoId: PhotoId): Promise<PhotoDetail> {
        return callOnBackground('fetchPhotoDetail', { photoId })
    },

    fetchPhotoWork(photoPath: string): Promise<PhotoWork> {
        return callOnBackground('fetchPhotoWork', { photoPath })
    },

    storePhotoWork(photoPath: string, photoWork: PhotoWork): Promise<void> {
        return callOnBackground('storePhotoWork', { photoPath, photoWork })
    },

    storeThumbnail(thumbnailPath: string, thumbnailData: string): Promise<void> {
        return callOnBackground('storeThumbnail', { thumbnailPath, thumbnailData })
    },

    fetchTags(): Promise<TagType[]> {
        return callOnBackground('fetchTags')
    },

    storePhotoTags(photoId: PhotoId, photoTags: string[]): Promise<TagType[] | null> {
        return callOnBackground('storePhotoTags', { photoId, photoTags })
    },

}

async function callOnBackground(action: string, params: any = null): Promise<any> {
    const callId = nextCallId++

    return new Promise<any>((resolve, reject) => {
        pendingCalls[callId] = { resolve, reject }
        ipcRenderer.send('executeBackgroundAction', callId, action, params)
    })
}
