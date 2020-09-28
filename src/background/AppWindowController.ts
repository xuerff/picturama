import { BrowserWindow } from 'electron'

import ForegroundClient from 'background/ForegroundClient'


let appWindow: BrowserWindow
let uiTesterWindow: BrowserWindow | null = null

export default {

    init(newAppWindow: BrowserWindow) {
        appWindow = newAppWindow
    },

    getAppWindow(): BrowserWindow {
        return appWindow
    },

    toggleFullScreen() {
        const isFullScreen = !appWindow.isFullScreen()
        ForegroundClient.onFullScreenChange(isFullScreen)
            // There are also event handlers in `background/entry.ts` which will set this
            // But we set it a little bit earlier, so the UI adjusts faster
            // (We can't remove the event handlers in `background/entry.ts` because there are other ways to toggle full screen)
        appWindow.setFullScreen(isFullScreen)
    },

    toggleUiTester() {
        if (uiTesterWindow) {
            uiTesterWindow.close()
            uiTesterWindow = null
        } else {
            uiTesterWindow = new BrowserWindow({
                title: 'UI Tester',
                webPreferences: {
                    nodeIntegration: true,
                }
            })
            uiTesterWindow.on('closed', () => { uiTesterWindow = null })
            uiTesterWindow.maximize()
            uiTesterWindow.loadURL('file://' + __dirname + '/test-ui.html')
            uiTesterWindow.webContents.toggleDevTools()
        }
    },

    reloadUi() {
        appWindow.reload()
        if (uiTesterWindow) {
            uiTesterWindow.reload()
        }
    },

}
