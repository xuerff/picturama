import fs from 'fs'
import { app, screen, ipcMain, BrowserWindow } from 'electron'
import DB from 'sqlite3-helper/no-generators'
import { install as initSourceMapSupport } from 'source-map-support'
import { start as initPrettyError } from 'pretty-error'

import MainMenu from './MainMenu'
// import Usb from './usb'
import config from '../common/config'
import Watch from './watch'
import { init as initBackgroundService } from './BackgroundService'
import { init as initForegroundClient } from './ForegroundClient'


initSourceMapSupport()
initPrettyError()

let initDbPromise: Promise<void> | null = null
let mainWindow: BrowserWindow | null = null


if (!fs.existsSync(config.dotAnsel))
    fs.mkdirSync(config.dotAnsel)


app.on('window-all-closed', () => {
    // if (process.platform !== 'darwin')
    app.quit()
})

app.on('ready', () => {
    let cursorPos = screen.getCursorScreenPoint()
    let workAreaSize = screen.getDisplayNearestPoint(cursorPos).workAreaSize

    app.setName('Ansel')

    mainWindow = new BrowserWindow({
        width: 1356,
        height: 768,
        title: 'Ansel',
        titleBarStyle: 'hiddenInset',
        backgroundColor: '#37474f',  // @blue-grey-800
        webPreferences: {
            experimentalFeatures: true,
            nodeIntegration: true,
        }
    })

    if (workAreaSize.width <= 1366 && workAreaSize.height <= 768)
        mainWindow.maximize()

    mainWindow.loadURL('file://' + __dirname + '/ui.html')
    mainWindow.setTitle('Ansel')
    initBackgroundService(mainWindow)
    initForegroundClient(mainWindow)

    //let usb = new Usb()
    //
    //usb.scan((err, drives) => {
    //  mainWindow.webContents.send('scanned-devices', drives)
    //})
    //
    //usb.watch((err, action, drive) => {
    //  if (action === 'add')
    //    mainWindow.webContents.send('add-device', drive)
    //  else
    //    mainWindow.webContents.send('remove-device', drive)
    //})

    if (fs.existsSync(config.settings)) {
        initLibrary(mainWindow)
    } else {
        initDb()
        ipcMain.on('settings-created', () => initLibrary(mainWindow))
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
})


function initDb(): Promise<void> {
    if (!initDbPromise) {
        const knex = require('knex')(config.knex)

        initDbPromise = knex.migrate.latest()
            .then(() =>
                DB({
                    path: config.knex.connection.filename,
                    migrate: {
                        force: false,
                        migrationsPath: config.knex.migrations.directory
                    }
                })
                .connection()
            )
            .catch(error => console.error('Initializing database failed', error))
    }

    return initDbPromise
}


async function initLibrary(mainWindow: BrowserWindow) {
    const Library = require('./Library').default

    await initDb()

    let library = new Library(mainWindow)
    let watcher = new Watch(mainWindow)

    new MainMenu(mainWindow, library)
    watcher.watch()
}
