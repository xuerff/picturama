import fs from 'fs'
import { ipcMain, Menu, MenuItemConstructorOptions, BrowserWindow } from 'electron'

import npmPackage from '../../package.json'

import config from 'common/config'
import { bindMany } from 'common/util/LangUtil'

import ForegroundClient from 'background/ForegroundClient'
import { startImport } from 'background/ImportScanner'


type MenuSpec = {
    label: string,
    submenu: {
        id?: string
        label: string
        enabled?: boolean
        accelerator?: string
        click?: string
    }[]
}

const template = JSON.parse(fs.readFileSync(config.menuPath)) as { menu: MenuSpec[] }

class MainMenu {

    private mainWindow: BrowserWindow
    private uiTesterWindow: BrowserWindow | null = null
    private template: { label: string, submenu: MenuItemConstructorOptions[] }[]
    private menu: Menu


    constructor(mainWindow: BrowserWindow) {
        this.mainWindow = mainWindow

        bindMany(this, 'render', 'showSettings', 'scan', 'close', 'reload', 'fullscreen', 'toggleDevTools', 'toggleUiTester', 'export')

        // TODO: Revive Legacy code of 'version' feature
        //this.fixMissingVersions = this.fixMissingVersions.bind(this)

        this.template = template.menu.map(menu => {
            return {
                label: menu.label,
                submenu: menu.submenu.map(submenu => {
                    if (submenu.click)
                        submenu.click = this[submenu.click]

                    if (submenu.label.toLowerCase() === 'version')
                        submenu.label = `Version ${npmPackage.version}`

                    return submenu as any as MenuItemConstructorOptions
                })
            }
        })

        ipcMain.on('toggleExportMenu', (e, state) => {
            this.menu.getMenuItemById('export').enabled = state
        })

        this.render()
    }

    showSettings() {
        ForegroundClient.showSettings()
    }

    scan() {
        startImport()
    }

    close() {
        this.mainWindow.close()
    }

    reload() {
        this.mainWindow.reload()
        if (this.uiTesterWindow) {
            this.uiTesterWindow.reload()
        }
    }

    fullscreen() {
        this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
    }

    toggleDevTools() {
        this.mainWindow.webContents.toggleDevTools()
    }

    toggleUiTester() {
        if (this.uiTesterWindow) {
            this.uiTesterWindow.close()
            this.uiTesterWindow = null
        } else {
            this.uiTesterWindow = new BrowserWindow({
                title: 'UI Tester',
                webPreferences: {
                    nodeIntegration: true,
                }
            })
            this.uiTesterWindow.maximize()
            this.uiTesterWindow.loadURL('file://' + __dirname + '/test-ui.html')
            this.uiTesterWindow.webContents.toggleDevTools()
        }
    }

    export() {
        this.mainWindow.webContents.send('exportClicked', true)
    }

    // TODO: Revive Legacy code of 'version' feature
    /*
    fixMissingVersions() {
        Version
            .query(qb =>
                qb
                    .innerJoin('photos', 'versions.photo_id', 'photos.id')
                    .where('output', null)
                    .orWhere('thumbnail', null)
            )
            .fetchAll()
            .then(versions => {
                versions.toJSON().forEach(version => {
                    let versionName = version.master!.match(/\w+-[\wéè]+-\d.\w{1,5}$/)![0]
                    let outputPath = `${this.versionsPath}/${versionName}`

                    if (fs.existsSync(outputPath)) {
                        // TODO: regenerate thumbnail
                        new Version({ id: version.id })
                            .save('output', outputPath, { patch: true })
                            .then(() => {
                                (Version as any).updateImage(outputPath.match(config.watchedFormats))
                            })
                    } else {
                        new Version({ id: version.id })
                            .destroy()
                            .catch(err => console.error('error while destroying', err))
                    }
                })
            })
    }
    */

    render() {
        this.menu = Menu.buildFromTemplate(this.template)
        Menu.setApplicationMenu(this.menu)
    }
}

export default MainMenu
