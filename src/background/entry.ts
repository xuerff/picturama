import os from 'os'
import { app, screen, BrowserWindow } from 'electron'
import DB from 'sqlite3-helper/no-generators'
import { DBOptions } from 'sqlite3-helper'
import { install as initSourceMapSupport } from 'source-map-support'
import { start as initPrettyError } from 'pretty-error'

import config from 'common/config'
import { setLocale } from 'common/i18n/i18n'

import MainMenu from 'background/MainMenu'
//import Usb from 'background/usb'
//import Watch from 'background/watch'
import { init as initBackgroundService, onBackgroundReady } from 'background/BackgroundService'
import ForegroundClient from 'background/ForegroundClient'
import { fsUnlink, fsUnlinkDeep, fsMkDirIfNotExists } from 'background/util/FileUtil'


initSourceMapSupport()
initPrettyError()

let initDbPromise: Promise<any> | null = null
let mainWindow: BrowserWindow | null = null


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

    const platform = os.platform()
    let icon: string | undefined = undefined
    if (platform === 'linux') {
        // Workaround for Linux: Setting the icon is buggy in electron-builder
        // See: https://github.com/electron-userland/electron-builder/issues/2577
        // Using the 1024x1024 icon makes the icon look bad (Ubuntu doesn't use anti-aliasing - at least for big icons)
        // -> We use a 128x128 px icon
        icon = __dirname + '/icon_128.png'
    }

    mainWindow = new BrowserWindow({
        width: 1356,
        height: 768,
        icon,
        title: 'Ansel',
        titleBarStyle: 'hiddenInset',
        backgroundColor: '#37474f',  // @blue-grey-800
        webPreferences: {
            nodeIntegration: true,
        }
    })

    if (workAreaSize.width <= 1366 && workAreaSize.height <= 768) {
        mainWindow.maximize()
    }

    mainWindow.loadURL('file://' + __dirname + '/app.html')
    mainWindow.setTitle('Ansel')
    initBackgroundService(mainWindow, { platform, locale })
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

    mainWindow.on('enter-full-screen', () => ForegroundClient.onFullScreenChange(true))
    mainWindow.on('leave-full-screen', () => ForegroundClient.onFullScreenChange(false))
    mainWindow.on('closed', () => { mainWindow = null })

    initDb()
        .then(() => {
            if (mainWindow) {
                new MainMenu(mainWindow)
            }
            onBackgroundReady()
        })
        .catch(error => {
            // TODO: Show error in UI
            console.error('Initializing failed', error)
        })
})


function initDb(): Promise<any> {
    if (!initDbPromise) {
        const dbOptions: DBOptions = { path: config.dbFile, migrate: false }
        initDbPromise =
            (async() => {
                await fsMkDirIfNotExists(config.dotAnsel)
                await Promise.all([
                    fsMkDirIfNotExists(config.tmp),
                    fsMkDirIfNotExists(config.nonRawPath),
                    fsMkDirIfNotExists(config.thumbnailPath),
                ])

                return DB(dbOptions)
                    .queryFirstCell<boolean>('SELECT 1 FROM sqlite_master WHERE type="table" AND name="knex_migrations"')
            })()
            .then(async (isLegacyDb) => {
                if (isLegacyDb) {
                    // This is a DB created with bookshelf.js and knex.js (before 2019-08-11)
                    // -> Delete the DB and create a new one
                    console.warn('Ansel database is a legacy database - creating a new one')
                    await Promise.all([
                        DB().close()
                            .then(() => fsUnlink(config.dbFile)),
                        fsUnlinkDeep(`${config.dotAnsel}/non-raw`),
                        fsUnlinkDeep(`${config.dotAnsel}/thumbs`),
                        fsUnlinkDeep(`${config.dotAnsel}/thumbs-250`),
                        fsUnlinkDeep(`${config.dotAnsel}/thumbnails`),
                    ])
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
    }

    return initDbPromise
}
