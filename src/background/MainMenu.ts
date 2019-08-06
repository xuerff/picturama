import fs from 'fs'
import { ipcMain, Menu, MenuItemConstructorOptions, BrowserWindow } from 'electron'

import config from '../common/config'
import Library from './Library';
import npmPackage from '../../package.json'


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
    private sandboxWindow: BrowserWindow | null = null
    private library: Library
    private template: { label: string, submenu: MenuItemConstructorOptions[] }[]
    private menu: Menu


    constructor(mainWindow: BrowserWindow, library: Library) {
        this.mainWindow = mainWindow
        this.library = library

        this.render = this.render.bind(this)
        this.scan = this.scan.bind(this)
        this.close = this.close.bind(this)
        this.reload = this.reload.bind(this)
        this.fullscreen = this.fullscreen.bind(this)
        this.toggleDevTools = this.toggleDevTools.bind(this)
        this.toggleSandbox = this.toggleSandbox.bind(this)
        this.export = this.export.bind(this)
        this.fixMissingVersions = this.fixMissingVersions.bind(this)

        this.template = template.menu.map(menu => {
            return {
                label: menu.label,
                submenu: menu.submenu.map(submenu => {
                    if (this.hasOwnProperty(submenu.click))
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

    scan() {
        this.library.scan()
    }

    close() {
        this.mainWindow.close()
    }

    reload() {
        this.mainWindow.reload()
        if (this.sandboxWindow) {
            this.sandboxWindow.reload()
        }
    }

    fullscreen() {
        this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
    }

    toggleDevTools() {
        this.mainWindow.webContents.toggleDevTools()
    }

    toggleSandbox() {
        if (this.sandboxWindow) {
            this.sandboxWindow.close()
            this.sandboxWindow = null
        } else {
            this.sandboxWindow = new BrowserWindow({
                title: 'UI Sandbox',
                webPreferences: {
                    experimentalFeatures: true,
                    nodeIntegration: true,
                }
            })
            this.sandboxWindow.maximize()
            this.sandboxWindow.loadURL('file://' + __dirname + '/sandbox.html')
            this.sandboxWindow.webContents.toggleDevTools()
        }
    }

    export() {
        this.mainWindow.webContents.send('exportClicked', true)
    }

    fixMissingVersions() {
        this.library.fixMissingVersions()
    }

    render() {
        this.menu = Menu.buildFromTemplate(this.template)
        Menu.setApplicationMenu(this.menu)
    }
}

export default MainMenu
