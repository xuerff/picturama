import { remote } from 'electron'
import { promisify } from 'bluebird'

import { PhotoWork } from './models/Photo'
import { assertRendererProcess } from './util/ElectronUtil'


assertRendererProcess()


interface IpcServerApi {
    storePhotoWorkWithCallback(photoPath: string, photoWork: PhotoWork, callback: (error: any) => void)
}


const ipcServer = remote.require('./IpcServer.js') as IpcServerApi


const ipcStorePhotoWork = promisify<void, string, PhotoWork>(ipcServer.storePhotoWorkWithCallback)
export async function storePhotoWork(photoPath: string, photoWork: PhotoWork): Promise<void> {
    await ipcStorePhotoWork(photoPath, photoWork)
}
