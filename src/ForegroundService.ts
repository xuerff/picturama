import { ipcRenderer } from 'electron'

import { assertRendererProcess } from './util/ElectronUtil'
import { ExifOrientation } from './models/DataTypes';
import { renderThumbnail } from './renderer/ThumbnailRenderer';
import { profileThumbnailRenderer } from './LogConstants';
import Profiler from './util/Profiler';


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
