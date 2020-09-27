import { ipcMain, Menu, BrowserWindow } from 'electron'

import config from 'common/config'

import ForegroundClient from 'background/ForegroundClient'
import { startImport } from 'background/ImportController'
import AppWindowController from 'background/AppWindowController'


/**
 * The main menu. Only used on MacOS.
 */
class MainMenu {

    private menu: Menu


    constructor(private mainWindow: BrowserWindow) {
        // TODO: Revive Legacy code of 'version' feature
        //this.fixMissingVersions = this.fixMissingVersions.bind(this)

        this.menu = Menu.buildFromTemplate([
            {
                label: 'Picturama',
                submenu: [
                    {
                        label: `Version ${config.version}`,
                        enabled: false
                    },
                    {
                        label: 'Settings',
                        click: () => ForegroundClient.showSettings()
                    },
                    {
                        label: 'Quit',
                        accelerator: 'Cmd+Q',
                        click: () => this.mainWindow.close()
                    }
                ]
            },
            {
                label: 'File',
                submenu: [
                    {
                        id: 'export',
                        label: 'Export picture(s)',
                        accelerator: 'Cmd+Shift+E',
                        enabled: false,
                        click: () => this.mainWindow.webContents.send('exportClicked', true)
                    },
                    {
                        label: 'Scan',
                        accelerator: 'Cmd+R',
                        click: startImport
                    }
                ]
            },
            {
                label: 'View',
                submenu: [
                    {
                        label: 'Enter Fullscreen',
                        accelerator: 'F11',
                        click: () => AppWindowController.toggleFullScreen()
                    }
                ]
            },
            {
                label: 'Developer',
                submenu: [
                    {
                        label: 'Toggle DevTools',
                        accelerator: 'Cmd+Alt+I',
                        click: () => this.mainWindow.webContents.toggleDevTools()
                    },
                    {
                        label: 'Toggle UI Tester',
                        accelerator: 'Cmd+Alt+T',
                        click: () => AppWindowController.toggleUiTester()
                    },
                    {
                        label: 'Reload',
                        accelerator: 'Shift+Cmd+R',
                        click: () => AppWindowController.reloadUi()
                    }
                ]
            }
        ])
        Menu.setApplicationMenu(this.menu)

        ipcMain.on('toggleExportMenu', (e, state) => {
            this.menu.getMenuItemById('export').enabled = state
        })
    }

    // TODO: Revive Legacy code of 'version' feature
    /*
    private fixMissingVersions() {
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

}

export default MainMenu
