import { BrowserWindow, ipcMain } from 'electron'

import { TagType } from 'common/models/Tag'
import { assertMainProcess } from 'common/util/ElectronUtil'
import { ImportProgress } from 'common/CommonTypes'


assertMainProcess()


interface CallInfo {
    resolve(result: any)
    reject(error: any)
}


let mainWindow: BrowserWindow | null = null

let nextCallId = 1
const pendingCalls: { [key:number]: CallInfo } = {}


export default {

    init(mainWin: BrowserWindow) {
        mainWindow = mainWin
    
        ipcMain.on('onForegroundActionDone', (event, callId, error, result) => {
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

    async setImportProgress(progress: ImportProgress | null, updatedTags: TagType[] | null): Promise<void> {
        return callOnForeground('setImportProgress', { progress, updatedTags })
    },
    
}


async function callOnForeground(action: string, params: any): Promise<any> {
    const callId = nextCallId++

    return new Promise<any>((resolve, reject) => {
        pendingCalls[callId] = { resolve, reject }
        if (!mainWindow) {
            reject(new Error('ForegroundClient not yet initialized'))
        } else {
            mainWindow.webContents.send('executeForegroundAction', callId, action, params)
        }
    })
}
