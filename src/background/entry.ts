import fs from 'fs'
import { app, screen, ipcMain, BrowserWindow } from 'electron'
import DB from 'sqlite3-helper/no-generators'
import { DBOptions } from 'sqlite3-helper'
import { install as initSourceMapSupport } from 'source-map-support'
import { start as initPrettyError } from 'pretty-error'
import BluebirdPromise from 'bluebird'

import config from 'common/config'
import { setLocale } from 'common/i18n/i18n'

import MainMenu from 'background/MainMenu'
// import Usb from 'background/usb'
import Watch from 'background/watch'
import { init as initBackgroundService } from 'background/BackgroundService'
import ForegroundClient from 'background/ForegroundClient'

const fsUnlink = BluebirdPromise.promisify(fs.unlink)


initSourceMapSupport()
initPrettyError()

let initDbPromise: Promise<any> | null = null
let mainWindow: BrowserWindow | null = null


if (!fs.existsSync(config.dotAnsel)) {
    fs.mkdirSync(config.dotAnsel)
}


app.on('window-all-closed', () => {
    // if (process.platform !== 'darwin')
    app.quit()
})

app.on('ready', () => {
    const locale = app.getLocale()
    setLocale(locale)

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
            nodeIntegration: true,
        }
    })

    if (workAreaSize.width <= 1366 && workAreaSize.height <= 768)
        mainWindow.maximize()

    mainWindow.loadURL('file://' + __dirname + '/ui.html')
    mainWindow.setTitle('Ansel')
    initBackgroundService(mainWindow, { locale })
    ForegroundClient.init(mainWindow)

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
        const nailedMainWindow = mainWindow
        ipcMain.on('settings-created', () => initLibrary(nailedMainWindow))
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
})


function initDb(): Promise<any> {
    if (!initDbPromise) {
        const dbOptions: DBOptions = { path: config.dbFile, migrate: false }
        initDbPromise = DB(dbOptions)
            .queryFirstCell<boolean>('SELECT 1 FROM sqlite_master WHERE type="table" AND name="knex_migrations"')
            .then(async (isLegacyDb) => {
                if (isLegacyDb) {
                    // This is a DB created with bookshelf.js and knex.js (before 2019-08-11)
                    // -> Delete the DB and create a new one
                    console.warn('Ansel database is a legacy database - creating a new one')
                    await DB().close()
                    await fsUnlink(config.dbFile)
                    DB(dbOptions)
                }
            })
            .then(async () => {
                await DB().connection()
                await DB().migrate({
                    force: false,
                    migrationsPath: config.dbMigrationsFolder
                })
            })
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
