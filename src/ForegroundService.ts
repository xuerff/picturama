import { ipcRenderer } from 'electron'

import { assertRendererProcess } from './util/ElectronUtil'
import { ExifOrientation } from './models/DataTypes';
import { renderThumbnail } from './renderer/ThumbnailRenderer';


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
        return renderThumbnail(params.photoPath, params.orientation, params.effects)
    } else {
        throw new Error('Unknown foreground action: ' + action)
    }
}
