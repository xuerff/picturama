import { remote } from 'electron'
import { promisify } from 'bluebird'

import { PhotoWork } from './models/Photo'
import { assertRendererProcess } from './util/ElectronUtil'


assertRendererProcess()


interface IpcServerApi {
    fetchPhotoWorkWithCallback(photoPath: string, callback: (error: any, result: PhotoWork) => void)
    storePhotoWorkWithCallback(photoPath: string, photoWork: PhotoWork, callback: (error: any) => void)
}


const ipcServer = remote.require('./IpcServer.js') as IpcServerApi


const ipcFetchPhotoWork = promisify<PhotoWork, string>(ipcServer.fetchPhotoWorkWithCallback)
export async function fetchPhotoWork(photoPath: string): Promise<PhotoWork> {
    return await ipcFetchPhotoWork(photoPath)
}


const ipcStorePhotoWork = promisify<void, string, PhotoWork>(ipcServer.storePhotoWorkWithCallback)
export async function storePhotoWork(photoPath: string, photoWork: PhotoWork): Promise<void> {
    await ipcStorePhotoWork(photoPath, photoWork)
}
